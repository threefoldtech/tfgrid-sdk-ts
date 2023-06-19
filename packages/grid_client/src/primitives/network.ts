import { Buffer } from "buffer";
import { plainToInstance } from "class-transformer";
import { Addr } from "netaddr";
import * as PATH from "path";
import { default as PrivateIp } from "private-ip";
import { default as TweetNACL } from "tweetnacl";

import { RMB } from "../clients/rmb/client";
import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { events } from "../helpers/events";
import { getRandomNumber, randomChoice } from "../helpers/utils";
import { BackendStorage, BackendStorageType } from "../storage/backend";
import { Deployment } from "../zos/deployment";
import { Workload, WorkloadTypes } from "../zos/workload";
import { Peer, Znet } from "../zos/znet";
import { Nodes } from "./nodes";

class WireGuardKeys {
  privateKey: string;
  publicKey: string;
}

class Node {
  node_id: number;
  contract_id: number;
  reserved_ips: string[] = [];
}

class AccessPoint {
  subnet: string;
  wireguard_public_key: string;
  node_id: number;
}

class Network {
  capacity: Nodes;
  nodes: Node[] = [];
  deployments: Deployment[] = [];
  reservedSubnets: string[] = [];
  networks: Znet[] = [];
  accessPoints: AccessPoint[] = [];
  backendStorage: BackendStorage;
  _endpoints: Record<string, string> = {};
  _accessNodes: number[] = [];
  rmb: RMB;
  wireguardConfig: string;
  tfClient: TFClient;

  constructor(public name: string, public ipRange: string, public config: GridClientConfig) {
    if (Addr(ipRange).prefix !== 16) {
      throw Error("Network ip_range should have a prefix 16");
    }
    if (!this.isPrivateIP(ipRange)) {
      throw Error("Network ip_range should be a private range");
    }
    this.backendStorage = new BackendStorage(
      config.backendStorageType,
      config.substrateURL,
      config.mnemonic,
      config.storeSecret,
      config.keypairType,
      config.backendStorage,
      config.seed,
    );
    this.rmb = new RMB(config.rmbClient);
    this.capacity = new Nodes(this.config.graphqlURL, this.config.proxyURL, this.config.rmbClient);
    this.tfClient = new TFClient(
      this.config.substrateURL,
      this.config.mnemonic,
      this.config.storeSecret,
      this.config.keypairType,
    );
  }

  private async saveIfKVStoreBackend(extrinsics) {
    if (this.config.backendStorageType === BackendStorageType.tfkvstore && extrinsics && extrinsics.length > 0) {
      extrinsics = extrinsics.filter(e => e !== undefined);
      if (extrinsics.length > 0) {
        await this.tfClient.connect();
        await this.tfClient.applyAllExtrinsics(extrinsics);
      }
    }
  }

  async addAccess(node_id: number, ipv4: boolean): Promise<string> {
    if (!this.nodeExists(node_id)) {
      throw Error(`Node ${node_id} does not exist in the network. Please add it first`);
    }
    events.emit("logs", `Adding access to node ${node_id}`);
    const accessNodes = await this.capacity.getAccessNodes();
    if (Object.keys(accessNodes).includes(node_id.toString())) {
      if (ipv4 && !accessNodes[node_id]["ipv4"]) {
        throw Error(`Node ${node_id} does not have ipv4 public config.`);
      }
    } else {
      throw Error(`Node ${node_id} is not an access node.`);
    }

    const nodeWGListeningPort = this.getNodeWGListeningPort(node_id);
    let endpoint = "";
    if (accessNodes[node_id]["ipv4"]) {
      endpoint = `${accessNodes[node_id]["ipv4"].split("/")[0]}:${nodeWGListeningPort}`;
    } else if (accessNodes[node_id]["ipv6"]) {
      endpoint = `[${accessNodes[node_id]["ipv6"].split("/")[0]}]:${nodeWGListeningPort}`;
    } else {
      throw Error(`Couldn't find ipv4 or ipv6 in the public config of node ${node_id} `);
    }

    const nodesWGPubkey = await this.getNodeWGPublicKey(node_id);
    const keypair = this.generateWireguardKeypair();
    const accessPoint = new AccessPoint();
    accessPoint.node_id = node_id;
    accessPoint.subnet = this.getFreeSubnet();
    accessPoint.wireguard_public_key = keypair.publicKey;

    this.accessPoints.push(accessPoint);
    await this.generatePeers();
    this.updateNetworkDeployments();
    this.wireguardConfig = this.getWireguardConfig(accessPoint.subnet, keypair.privateKey, nodesWGPubkey, endpoint);
    return this.wireguardConfig;
  }

  async addNode(node_id: number, metadata = "", description = "", subnet = ""): Promise<Workload | undefined> {
    if (this.nodeExists(node_id)) {
      return;
    }
    events.emit("logs", `Adding node ${node_id} to network ${this.name}`);
    const keypair = this.generateWireguardKeypair();
    let znet = new Znet();
    if (!subnet) {
      znet.subnet = this.getFreeSubnet();
    } else {
      znet.subnet = subnet;
    }
    znet.ip_range = this.ipRange;
    znet.wireguard_private_key = keypair.privateKey;
    znet.wireguard_listen_port = await this.getFreePort(node_id);
    znet["node_id"] = node_id;

    this.networks.push(znet);
    await this.generatePeers();
    this.updateNetworkDeployments();
    znet = this.updateNetwork(znet);

    const znet_workload = new Workload();
    znet_workload.version = 0;
    znet_workload.name = this.name;
    znet_workload.type = WorkloadTypes.network;
    znet_workload.data = znet;
    znet_workload.metadata = metadata;
    znet_workload.description = description;

    const node = new Node();
    node.node_id = node_id;
    this.nodes.push(node);

    return znet_workload;
  }

  async deleteNode(node_id: number): Promise<number> {
    if (!(await this.exists())) {
      return 0;
    }
    events.emit("logs", `Deleting node ${node_id} from network ${this.name}`);
    let contract_id = 0;
    const nodes: Node[] = [];
    for (const node of this.nodes) {
      if (node.node_id !== node_id) {
        nodes.push(node);
      } else {
        contract_id = node.contract_id;
      }
    }
    this.nodes = nodes;
    this.networks = this.networks.filter(net => net["node_id"] !== node_id);
    const net = this.networks.filter(net => net["node_id"] === node_id);
    this.reservedSubnets = this.reservedSubnets.filter(subnet => subnet === net[0].subnet);

    return contract_id;
  }

  updateNetwork(znet): Znet {
    for (const net of this.networks) {
      if (net.subnet === znet.subnet) {
        return net;
      }
    }
    return znet;
  }

  updateNetworkDeployments(): void {
    for (const net of this.networks) {
      for (const deployment of this.deployments) {
        const workloads = deployment["workloads"];
        for (const workload of workloads) {
          if (workload["type"] !== WorkloadTypes.network) {
            continue;
          }
          if (net.subnet === workload["data"]["subnet"]) {
            workload["data"] = net;
            break;
          }
        }
        deployment["workloads"] = workloads;
      }
    }
  }

  async load(): Promise<void> {
    if (!(await this.exists())) {
      return;
    }
    events.emit("logs", `Loading network ${this.name}`);
    const network = await this.getNetwork();
    if (network["ip_range"] !== this.ipRange) {
      throw Error(`The same network name ${this.name} with a different ip range already exists`);
    }

    await this.tfClient.connect();
    for (const node of network["nodes"]) {
      const contract = await this.tfClient.contracts.get({ id: node.contract_id });
      if (contract === null) continue;
      const node_twin_id = await this.capacity.getNodeTwinId(node.node_id);
      const payload = JSON.stringify({ contract_id: node.contract_id });
      let res;
      try {
        res = await this.rmb.request([node_twin_id], "zos.deployment.get", payload);
      } catch (e) {
        throw Error(`Failed to load network deployment ${node.contract_id} due to ${e}`);
      }
      res["node_id"] = node.node_id;
      for (const workload of res["workloads"]) {
        if (
          workload["type"] !== WorkloadTypes.network ||
          !Addr(this.ipRange).contains(Addr(workload["data"]["subnet"]))
        ) {
          continue;
        }
        if (workload.result.state === "deleted") {
          continue;
        }
        const znet = this._fromObj(workload["data"]);
        znet["node_id"] = node.node_id;
        const n: Node = node;
        this.nodes.push(n);
        this.networks.push(znet);
        this.deployments.push(res);
      }
    }
    await this.getAccessPoints();
    await this.save();
  }

  _fromObj(net: Znet): Znet {
    const znet = plainToInstance(Znet, net);
    return znet;
  }

  async exists(): Promise<boolean> {
    return (await this.getNetworkNames()).includes(this.name);
  }

  nodeExists(node_id: number): boolean {
    for (const net of this.networks) {
      if (net["node_id"] === node_id) {
        return true;
      }
    }
    return false;
  }

  hasAccessPoint(node_id: number): boolean {
    for (const accessPoint of this.accessPoints) {
      if (node_id === accessPoint.node_id) {
        return true;
      }
    }
    return false;
  }

  async getAccessNodes(): Promise<number[]> {
    if (this._accessNodes.length !== 0) {
      return this._accessNodes;
    }
    const accessNodes: number[] = [];
    const allAccessNodes = await this.capacity.getAccessNodes();
    for (const accessNode of Object.keys(allAccessNodes)) {
      if (this.nodeExists(+accessNode)) {
        accessNodes.push(+accessNode);
      }
    }
    this._accessNodes = accessNodes;
    return accessNodes;
  }

  generateWireguardKeypair() {
    const keypair = TweetNACL.box.keyPair();
    const wg = new WireGuardKeys();
    wg.privateKey = Buffer.from(keypair.secretKey).toString("base64");
    wg.publicKey = Buffer.from(keypair.publicKey).toString("base64");
    return wg;
  }

  getPublicKey(privateKey: string): string {
    const privKey = Buffer.from(privateKey, "base64");
    const keypair = TweetNACL.box.keyPair.fromSecretKey(privKey);
    return Buffer.from(keypair.publicKey).toString("base64");
  }

  async getNodeWGPublicKey(node_id: number): Promise<string | undefined> {
    for (const net of this.networks) {
      if (net["node_id"] == node_id) {
        return this.getPublicKey(net.wireguard_private_key);
      }
    }
  }

  getNodeWGListeningPort(node_id: number): number | undefined {
    for (const net of this.networks) {
      if (net["node_id"] == node_id) {
        return net.wireguard_listen_port;
      }
    }
  }

  getFreeIP(node_id: number, subnet = ""): string | undefined {
    let ip;
    if (!this.nodeExists(node_id) && subnet) {
      ip = Addr(subnet).mask(32).increment().increment();
    } else if (this.nodeExists(node_id)) {
      ip = Addr(this.getNodeSubnet(node_id)).mask(32).increment().increment();
      const reserved_ips = this.getNodeReservedIps(node_id);
      while (reserved_ips.includes(ip.toString().split("/")[0])) {
        ip = ip.increment();
      }
    } else {
      throw Error("node_id or subnet must be specified");
    }
    if (ip) {
      ip = ip.toString().split("/")[0];
      for (const node of this.nodes) {
        if (node.node_id === node_id) {
          node.reserved_ips.push(ip);
          return ip;
        }
      }
      throw Error(`node_id is not in the network. Please add it first`);
    }
  }
  validateUserIP(node_id: number, ip_address = "") {
    const reserved_ips = this.getNodeReservedIps(node_id);
    if (reserved_ips.includes(ip_address)) {
      throw Error(`private ip ${ip_address} is being used please select another ip or leave it empty`);
    }

    const nodeSubnet = this.getNodeSubnet(node_id);
    const ip = Addr(ip_address);

    if (!Addr(nodeSubnet).contains(ip)) {
      throw Error(`Selected ip is not available in node subnet, node subnet: ${nodeSubnet}`);
    }
    for (const node of this.nodes) {
      if (node.node_id === node_id) {
        node.reserved_ips.push(ip_address);
        return ip_address;
      }
    }
  }
  getNodeReservedIps(node_id: number): string[] {
    for (const node of this.nodes) {
      if (node.node_id !== node_id) {
        continue;
      }
      return node.reserved_ips;
    }
    return [];
  }

  deleteReservedIp(node_id: number, ip: string): string {
    for (const node of this.nodes) {
      if (node.node_id === node_id) {
        node.reserved_ips = node.reserved_ips.filter(item => item !== ip);
      }
    }
    return ip;
  }

  getNodeSubnet(node_id: number): string | undefined {
    for (const net of this.networks) {
      if (net["node_id"] === node_id) {
        return net.subnet;
      }
    }
  }

  getReservedSubnets(): string[] {
    for (const node of this.nodes) {
      const subnet = this.getNodeSubnet(node.node_id);
      if (subnet && !this.reservedSubnets.includes(subnet)) {
        this.reservedSubnets.push(subnet);
      }
    }
    for (const accessPoint of this.accessPoints) {
      if (accessPoint.subnet && !this.reservedSubnets.includes(accessPoint.subnet)) {
        this.reservedSubnets.push(accessPoint.subnet);
      }
    }
    for (const network of this.networks) {
      if (!this.reservedSubnets.includes(network.subnet)) {
        this.reservedSubnets.push(network.subnet);
      }
    }
    return this.reservedSubnets;
  }

  getFreeSubnet(): string {
    const reservedSubnets = this.getReservedSubnets();
    let subnet = Addr(this.ipRange).mask(24).nextSibling().nextSibling();
    while (reservedSubnets.includes(subnet.toString())) {
      subnet = subnet.nextSibling();
    }
    this.reservedSubnets.push(subnet.toString());
    return subnet.toString();
  }

  ValidateFreeSubnet(subnet): string {
    const reservedSubnets = this.getReservedSubnets();
    if (!reservedSubnets.includes(subnet)) {
      this.reservedSubnets.push(subnet);
      return subnet;
    } else {
      throw Error(`subnet ${subnet} is not free`);
    }
  }

  async getAccessPoints(): Promise<AccessPoint[]> {
    const nodesWGPubkeys: string[] = [];
    for (const network of this.networks) {
      const pubkey = this.getPublicKey(network.wireguard_private_key);
      nodesWGPubkeys.push(pubkey);
    }
    for (const network of this.networks) {
      for (const peer of network.peers) {
        if (nodesWGPubkeys.includes(peer.wireguard_public_key)) {
          continue;
        }
        if (peer.endpoint !== "") {
          continue;
        }
        const accessPoint = new AccessPoint();
        accessPoint.subnet = peer.subnet;
        accessPoint.wireguard_public_key = peer.wireguard_public_key;
        accessPoint.node_id = network["node_id"];
        this.accessPoints.push(accessPoint);
      }
    }
    return this.accessPoints;
  }

  getNetworksPath() {
    return PATH.join(this.config.storePath, "networks");
  }

  async getNetwork() {
    const path = this.getNetworksPath();
    return await this.backendStorage.load(PATH.join(path, this.name, "info.json"));
  }

  async getNetworkNames(): Promise<string[]> {
    const path = this.getNetworksPath();
    return await this.backendStorage.list(path);
  }

  async getFreePort(node_id: number): Promise<number> {
    const node_twin_id = await this.capacity.getNodeTwinId(node_id);
    let result;
    try {
      result = await this.rmb.request([node_twin_id], "zos.network.list_wg_ports", "");
    } catch (e) {
      throw Error(`Couldn't get free Wireguard ports for node ${node_id} due to ${e}`);
    }
    events.emit("logs", `Node ${node_id} reserved ports: ${JSON.stringify(result)}`);

    let port = 0;
    while (!port || result.includes(port)) {
      port = getRandomNumber(2000, 8000);
    }
    return port;
  }

  isPrivateIP(ip: string): boolean {
    return PrivateIp(ip.split("/")[0]);
  }

  async getNodeEndpoint(node_id: number): Promise<string> {
    if (Object.keys(this._endpoints).includes(String(node_id))) {
      return this._endpoints[node_id];
    }
    const node_twin_id = await this.capacity.getNodeTwinId(node_id);
    let result;
    try {
      result = await this.rmb.request([node_twin_id], "zos.network.public_config_get", "");
    } catch (e) {
      console.log(`Couldn't get public config for node ${node_id} due to ${e}`);
    }
    events.emit("logs", `Node ${node_id} public config: ${JSON.stringify(result)}`);

    let endpoint;
    if (result) {
      const ipv4 = result.ipv4;
      const ipv6 = result.ipv6;
      if (!this.isPrivateIP(ipv4)) {
        endpoint = ipv4.split("/")[0];
      } else if (!this.isPrivateIP(ipv6)) {
        endpoint = ipv6.split("/")[0];
      }
    }
    if (!endpoint) {
      try {
        result = await this.rmb.request([node_twin_id], "zos.network.interfaces", "");
      } catch (e) {
        throw Error(`Couldn't get the network interfaces for node ${node_id} due to ${e}`);
      }
      events.emit("logs", `Node ${node_id} network interfaces: ${JSON.stringify(result)}`);

      if (result) {
        for (const iface of Object.keys(result)) {
          if (iface !== "zos") {
            continue;
          }
          for (const ip of result[iface]) {
            if (!this.isPrivateIP(ip)) {
              endpoint = ip;
            }
          }
        }
      }
    }

    this._endpoints[node_id] = endpoint;
    return endpoint;
  }

  wgRoutingIP(subnet: string): string {
    const subnetsParts = subnet.split(".");
    return `100.64.${subnetsParts[1]}.${subnetsParts[2].split("/")[0]}/32`;
  }

  getWireguardConfig(subnet: string, userprivKey: string, peerPubkey: string, endpoint: string): string {
    const userIP = this.wgRoutingIP(subnet);
    const networkIP = this.wgRoutingIP(this.ipRange);
    return `[Interface]\nAddress = ${userIP}
PrivateKey = ${userprivKey}\n\n[Peer]\nPublicKey = ${peerPubkey}
AllowedIPs = ${this.ipRange}, ${networkIP}
PersistentKeepalive = 25\nEndpoint = ${endpoint}`;
  }

  async save(contract_id = 0, node_id = 0) {
    let network;
    if (await this.exists()) {
      network = await this.getNetwork();
    } else {
      network = {
        ip_range: this.ipRange,
        nodes: [],
        wireguardConfigs: [],
      };
    }

    if (this.wireguardConfig && !network.wireguardConfigs.includes(this.wireguardConfig)) {
      network.wireguardConfigs.push(this.wireguardConfig);
    }

    if (this.nodes.length === 0) {
      await this.delete();
      return;
    }

    const nodes = [];
    for (const node of this.nodes) {
      if (!node.contract_id && node.node_id === node_id) {
        node.contract_id = contract_id;
      }
      if (!node.contract_id) {
        continue;
      }
      nodes.push({
        contract_id: node.contract_id,
        node_id: node.node_id,
        reserved_ips: this.getNodeReservedIps(node.node_id),
      });
    }
    network.nodes = nodes;
    if (nodes.length !== 0) {
      await this._save(network);
    } else {
      await this.delete();
    }
  }

  async _save(network): Promise<void> {
    const path = PATH.join(this.getNetworksPath(), this.name, "info.json");
    const current = await this.backendStorage.load(path);
    if (JSON.stringify(current) !== JSON.stringify(network)) {
      const updateOperations = await this.backendStorage.dump(path, network);
      await this.saveIfKVStoreBackend(updateOperations);
    }
  }

  async delete(): Promise<void> {
    events.emit("logs", `Deleting network ${this.name}`);
    const path = PATH.join(this.getNetworksPath(), this.name, "info.json");
    const updateOperations = await this.backendStorage.dump(path, "");
    await this.saveIfKVStoreBackend(updateOperations);
  }

  async generatePeers(): Promise<void> {
    events.emit("logs", `Generating peers for network ${this.name}`);
    const hiddenNodeAccessNodesIds = {};
    const hiddenNodes: AccessPoint[] = [];
    for (const net of this.networks) {
      if (this.networks.length === 1) {
        continue;
      }
      const accessIP = await this.getNodeEndpoint(net["node_id"]);
      if (accessIP) {
        continue;
      }
      const accessNodes = await this.getAccessNodes();
      if (accessNodes.length === 0) {
        throw Error(
          `Couldn't add node ${net["node_id"]} as it's a hidden node ` +
            `and there is no access node in this network ${this.name}. ` +
            "Please add addAccess = true in the network configuration.",
        );
      }
      const accessNode = randomChoice(accessNodes);
      hiddenNodeAccessNodesIds[net["node_id"]] = accessNode;
      const hiddenNode: AccessPoint = new AccessPoint();
      hiddenNode.node_id = accessNode;
      hiddenNode.subnet = net.subnet;
      hiddenNode.wireguard_public_key = this.getPublicKey(net.wireguard_private_key);
      hiddenNodes.push(hiddenNode);
    }
    const accessPoints = [...this.accessPoints, ...hiddenNodes];

    for (const n of this.networks) {
      n.peers = [];
      for (const net of this.networks) {
        if (n["node_id"] === net["node_id"]) {
          continue;
        }
        const allowed_ips: string[] = [];
        if (Object.keys(hiddenNodeAccessNodesIds).includes(String(n["node_id"]))) {
          if (net["node_id"] !== +hiddenNodeAccessNodesIds[n["node_id"]]) {
            continue;
          }
          for (const subnet of this.getReservedSubnets()) {
            if (subnet === n.subnet || subnet === net.subnet) {
              continue;
            }
            allowed_ips.push(subnet);
            allowed_ips.push(this.wgRoutingIP(subnet));
          }
        }
        allowed_ips.push(net.subnet);
        allowed_ips.push(this.wgRoutingIP(net.subnet));

        // add access points as allowed ips if this node "net" is the access node and has access point to it
        for (const accessPoint of accessPoints) {
          if (accessPoint.node_id === net["node_id"]) {
            if (allowed_ips.includes(accessPoint.subnet)) {
              continue;
            }
            allowed_ips.push(accessPoint.subnet);
            allowed_ips.push(this.wgRoutingIP(accessPoint.subnet));
          }
        }
        let accessIP = await this.getNodeEndpoint(net["node_id"]);
        if (!accessIP) {
          continue;
        }
        if (accessIP.includes(":")) {
          accessIP = `[${accessIP}]`;
        }
        const peer = new Peer();
        peer.subnet = net.subnet;
        peer.wireguard_public_key = this.getPublicKey(net.wireguard_private_key);
        peer.allowed_ips = allowed_ips;
        peer.endpoint = `${accessIP}:${net.wireguard_listen_port}`;
        n.peers.push(peer);
      }
      for (const accessPoint of accessPoints) {
        if (n["node_id"] === accessPoint.node_id) {
          const allowed_ips: string[] = [];
          allowed_ips.push(accessPoint.subnet);
          allowed_ips.push(this.wgRoutingIP(accessPoint.subnet));
          const peer = new Peer();
          peer.subnet = accessPoint.subnet;
          peer.wireguard_public_key = accessPoint.wireguard_public_key;
          peer.allowed_ips = allowed_ips;
          peer.endpoint = "";
          n.peers.push(peer);
        }
      }
    }
  }
}

export { Network, AccessPoint, WireGuardKeys, Node };
