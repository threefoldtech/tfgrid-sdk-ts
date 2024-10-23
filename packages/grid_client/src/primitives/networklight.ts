import { Contract } from "@threefold/tfchain_client";
import { ValidationError } from "@threefold/types";
import { Buffer } from "buffer";
import { plainToInstance } from "class-transformer";
import { Addr } from "netaddr";
import * as PATH from "path";
import { default as PrivateIp } from "private-ip";
import { default as TweetNACL } from "tweetnacl";

import { RMB } from "../clients/rmb/client";
import { TFClient } from "../clients/tf-grid/client";
import { GqlNodeContract } from "../clients/tf-grid/contracts";
import { GridClientConfig } from "../config";
import { events } from "../helpers/events";
import { formatErrorMessage, generateRandomHexSeed } from "../helpers/utils";
import { validateHexSeed } from "../helpers/validator";
import { MyceliumNetworkModel } from "../modules";
import { BackendStorage } from "../storage/backend";
import { NetworkLight } from "../zos";
import { Deployment } from "../zos/deployment";
import { Workload, WorkloadTypes } from "../zos/workload";
import { Nodes } from "./nodes";

class Node {
  node_id: number;
  contract_id: number;
  reserved_ips: string[] = [];
}
interface NetworkMetadata {
  version: number;
}
class ZNetworkLight {
  node: Node;
  capacity: Nodes;
  deployments: Deployment[] = [];
  network: NetworkLight;
  contracts: Required<GqlNodeContract>[];
  reservedSubnets: string[] = [];
  backendStorage: BackendStorage;
  static newContracts: GqlNodeContract[] = [];
  static deletedContracts: number[] = [];
  rmb: RMB;
  wireguardConfig: string;
  tfClient: TFClient;

  constructor(public name: string, public ipRange: string, public config: GridClientConfig) {
    if (Addr(ipRange).prefix !== 24) {
      this.ipRange = Addr(ipRange).mask(24);
      this.ipRange.toString();
    }
    if (!this.isPrivateIP(ipRange)) {
      throw new ValidationError("Network ip_range should be a private range.");
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
    this.tfClient = config.tfclient;
  }

  private getUpdatedMetadata(nodeId: number, metadata: string): string {
    if (this.node.node_id === nodeId) {
      const parsedMetadata: NetworkMetadata = JSON.parse(metadata || "{}");
      parsedMetadata.version = 4;
      return JSON.stringify(parsedMetadata);
    }

    return metadata;
  }

  updateWorkload(nodeId: number, workload: Workload): Workload {
    workload.data = this.getUpdatedNetwork(workload.data);
    workload.metadata = this.getUpdatedMetadata(nodeId, workload.metadata);
    return workload;
  }
  getUpdatedNetwork(znet_light): NetworkLight {
    if (this.network.subnet === znet_light.subnet) {
      return this.network;
    }

    return znet_light;
  }

  async addNode(
    nodeId: number,
    mycelium: boolean,
    description = "",
    subnet = "",
    myceliumSeeds: MyceliumNetworkModel,
  ): Promise<Workload | undefined> {
    events.emit("logs", `Adding node ${nodeId} to network ${this.name}`);
    let znet_light = new NetworkLight();
    if (!subnet) {
      znet_light.subnet = this.getFreeSubnet();
    } else {
      znet_light.subnet = subnet;
    }
    znet_light["node_id"] = nodeId;

    if (mycelium) {
      let seed = generateRandomHexSeed(32);
      if (myceliumSeeds?.seed) {
        seed = myceliumSeeds.seed;
        validateHexSeed(seed, 32);
      }

      znet_light.mycelium = {
        hex_key: seed,
        peers: [],
      };
    }

    this.network = znet_light;
    znet_light = this.getUpdatedNetwork(znet_light);

    const znet_light_workload = new Workload();
    znet_light_workload.version = 0;
    znet_light_workload.name = this.name;
    znet_light_workload.type = WorkloadTypes.network;
    znet_light_workload.data = znet_light;
    znet_light_workload.metadata = "";
    znet_light_workload.description = description;

    this.node.node_id = nodeId;

    return znet_light_workload;
  }

  _fromObj(net: NetworkLight): NetworkLight {
    const znet_light = plainToInstance(NetworkLight, net);
    return znet_light;
  }

  getFreeIP(node_id: number, subnet = ""): string | undefined {
    let ip;

    if (this.network["node_id"] !== node_id && subnet) {
      ip = Addr(subnet).mask(32).increment().increment();
    } else if (this.network["node_id"] === node_id) {
      ip = Addr(this.getNodeSubnet(node_id)).mask(32).increment().increment();
    } else {
      throw new ValidationError("node_id or subnet must be specified.");
    }
    if (ip) {
      ip = ip.toString().split("/")[0];
      if (this.node.node_id === node_id) {
        this.node.reserved_ips.push(ip);
        return ip;
      }
      throw new ValidationError(`node_id is not in the network. Please add it first.`);
    }
  }

  validateUserIP(node_id: number, ip_address = "") {
    const nodeSubnet = this.getNodeSubnet(node_id);
    const ip = Addr(ip_address);

    if (!Addr(nodeSubnet).contains(ip)) {
      throw new ValidationError(`Selected ip is not available in node subnet, node subnet: ${nodeSubnet}`);
    }
    if (this.node.node_id === node_id) {
      this.node.reserved_ips.push(ip_address);
      return ip_address;
    }
  }

  getNodeSubnet(node_id: number): string | undefined {
    if (this.network["node_id"] === node_id) {
      return this.network.subnet;
    }
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

  getReservedSubnets(): string[] {
    const subnet = this.getNodeSubnet(this.node.node_id);
    if (subnet && !this.reservedSubnets.includes(subnet)) {
      this.reservedSubnets.push(subnet);
    }

    return this.reservedSubnets;
  }

  private async getMyNetworkContracts(fetch = false) {
    if (fetch || !this.contracts) {
      let contracts = await this.tfClient.contracts.listMyNodeContracts({
        graphqlURL: this.config.graphqlURL,
        type: "network-light",
      });
      const alreadyFetchedContracts: GqlNodeContract[] = [];
      for (const contract of ZNetworkLight.newContracts) {
        if (contract.parsedDeploymentData!.type !== "network-light") continue;
        const c = contracts.filter(c => +c.contractID === +contract.contractID);
        if (c.length > 0) {
          alreadyFetchedContracts.push(contract);
          continue;
        }
        contracts.push(contract);
      }

      for (const contract of alreadyFetchedContracts) {
        const index = ZNetworkLight.newContracts.indexOf(contract);
        if (index > -1) ZNetworkLight.newContracts.splice(index, 1);
      }

      contracts = contracts.filter(c => !ZNetworkLight.deletedContracts.includes(+c.contractID));

      const parsedContracts: Required<GqlNodeContract>[] = [];

      for (const contract of contracts) {
        const parsedDeploymentData = JSON.parse(contract.deploymentData);
        parsedContracts.push({ ...contract, parsedDeploymentData });
      }

      this.contracts = parsedContracts;
    }

    return this.contracts;
  }
  async load(): Promise<void> {
    if (!(await this.exists())) {
      return;
    }
    events.emit("logs", `Loading network ${this.name}`);

    await this.loadNetworkFromContracts();

    //  else {
    //   const network = await this.getNetwork();
    //   if (network["ip_range"] !== this.ipRange) {
    //     throw new ValidationError(`The same network name ${this.name} with a different ip range already exists.`);
    //   }

    //   await this.tfClient.connect();
    //   for (const node of network["nodes"]) {
    //     const contract = await this.tfClient.contracts.get({
    //       id: node.contract_id,
    //     });
    //     if (contract === null) continue;
    //     const node_twin_id = await this.capacity.getNodeTwinId(node.node_id);
    //     const payload = JSON.stringify({ contract_id: node.contract_id });
    //     let res;
    //     try {
    //       res = await this.rmb.request([node_twin_id], "zos.deployment.get", payload);
    //     } catch (e) {
    //       (e as Error).message = formatErrorMessage(`Failed to load network deployment ${node.contract_id}`, e);
    //       throw e;
    //     }
    //     res["node_id"] = node.node_id;
    //     for (const workload of res["workloads"]) {
    //       if (
    //         workload["type"] !== WorkloadTypes.network ||
    //         !Addr(this.ipRange).contains(Addr(workload["data"]["subnet"]))
    //       ) {
    //         continue;
    //       }
    //       if (workload.result.state === "deleted") {
    //         continue;
    //       }
    //       const znet = this._fromObj(workload["data"]);
    //       znet["node_id"] = node.node_id;
    //       const n: Node = node;
    //       this.nodes.push(n);
    //       this.networks.push(znet);
    //       this.deployments.push(res);
    //     }
    //   }
    // }
  }

  private async getReservedIps(nodeId: number): Promise<string[]> {
    const node_twin_id = await this.capacity.getNodeTwinId(nodeId);
    const payload = JSON.stringify({ network_name: this.name });
    let reservedIps: string[];
    try {
      reservedIps = await this.rmb.request([node_twin_id], "zos.network.list_private_ips", payload);
    } catch (e) {
      (e as Error).message = formatErrorMessage(`Failed to list reserved ips from node ${nodeId}`, e);
      throw e;
    }
    return reservedIps;
  }

  private async loadNetworkFromContracts() {
    const contracts = await this.getDeploymentContracts(this.name);
    for (const contract of contracts) {
      const node_twin_id = await this.capacity.getNodeTwinId(contract.nodeID);
      const payload = JSON.stringify({ contract_id: +contract.contractID });
      let res: Deployment;
      try {
        res = await this.rmb.request([node_twin_id], "zos.deployment.get", payload);
      } catch (e) {
        (e as Error).message = formatErrorMessage(`Failed to load network deployment ${contract.contractID}`, e);
        throw e;
      }
      res["node_id"] = contract.nodeID;
      for (const workload of res.workloads) {
        const data = workload.data as NetworkLight;
        if (workload.type !== WorkloadTypes.network || workload.name !== this.name) {
          continue;
        }
        if (workload.result.state === "deleted") {
          continue;
        }
        const znet_light = this._fromObj(data);
        znet_light["node_id"] = contract.nodeID;
        const reservedIps = await this.getReservedIps(contract.nodeID);

        if (znet_light.subnet !== this.ipRange) {
          throw new ValidationError(`The same network name ${this.name} with a different ip range already exists.`);
        }
        this.node = {
          contract_id: +contract.contractID,
          node_id: contract.nodeID,
          reserved_ips: reservedIps,
        };
        this.network = znet_light;
        this.deployments.push(res);
      }
    }
  }

  private async getDeploymentContracts(name: string) {
    const contracts = await this.getMyNetworkContracts(true);
    return contracts.filter(c => c.parsedDeploymentData.name === name);
  }

  private getContractsName(contracts: Required<GqlNodeContract>[]): string[] {
    return Array.from(new Set(contracts.map(c => c.parsedDeploymentData.name)));
  }

  private async listAllNetworks() {
    const contracts = await this.getMyNetworkContracts(true);
    return this.getContractsName(contracts);
  }

  private async exists() {
    return (await this.listAllNetworks()).includes(this.name);
  }

  isPrivateIP(ip: string): boolean {
    return PrivateIp(ip.split("/")[0]);
  }
}

export { ZNetworkLight, Node };
