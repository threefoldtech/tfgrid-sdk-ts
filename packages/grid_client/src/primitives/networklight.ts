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
import { generateRandomHexSeed } from "../helpers/utils";
import { validateHexSeed } from "../helpers/validator";
import { ContractStates, MyceliumNetworkModel } from "../modules";
import { BackendStorage, BackendStorageType } from "../storage/backend";
import { NetworkLight } from "../zos";
import { Deployment } from "../zos/deployment";
import { Workload, WorkloadTypes } from "../zos/workload";

class Node {
  node_id: number;
  contract_id: number;
  reserved_ips: string[] = [];
}

class ZNetworkLight {
  node: Node;
  deployments: Deployment[] = [];
  network: NetworkLight;
  contracts: Required<GqlNodeContract>[];
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
    // this.capacity = new Nodes(this.config.graphqlURL, this.config.proxyURL, this.config.rmbClient);
    this.tfClient = config.tfclient;
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
  // Check this later
  // private getUpdatedMetadata(nodeId: number, metadata: string): string {
  //   for (const node of this.nodes) {
  //     if (node.node_id === nodeId) {
  //       const parsedMetadata: NetworkMetadata = JSON.parse(metadata || "{}");
  //       parsedMetadata.version = 3;
  //       parsedMetadata.user_accesses = this.userAccesses;
  //       return JSON.stringify(parsedMetadata);
  //     }
  //   }
  //   return metadata;
  // }

  // updateWorkload(nodeId: number, workload: Workload): Workload {
  //   workload.data = this.getUpdatedNetwork(workload.data);
  //   workload.metadata = this.getUpdatedMetadata(nodeId, workload.metadata);
  //   return workload;
  // }

  async addNode(
    nodeId: number,
    mycelium: boolean,
    description = "",
    subnet = "",
    myceliumSeeds: MyceliumNetworkModel,
  ): Promise<Workload | undefined> {
    events.emit("logs", `Adding node ${nodeId} to network ${this.name}`);
    // const keypair = this.generateWireguardKeypair();
    const znet_light = new NetworkLight();
    if (!subnet) {
      znet_light.subnet = this.getFreeSubnet();
    } else {
      znet_light.subnet = subnet;
    }
    // Check this subnet=iprange?
    // znet.ip_range = this.ipRange;

    znet_light["node_id"] = nodeId;

    if (mycelium) {
      // const myceliumNetworkSeed = myceliumSeeds.find(item => item.nodeId === nodeId);
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

    // Check this later
    // await this.generatePeers();
    // this.updateNetworkDeployments();
    // znet = this.getUpdatedNetwork(znet);

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

  getUpdatedNetwork(znet_light): NetworkLight {
    if (this.network.subnet === znet_light.subnet) {
      return this.network;
    }

    return znet_light;
  }

  _fromObj(net: NetworkLight): NetworkLight {
    const znet_light = plainToInstance(NetworkLight, net);
    return znet_light;
  }

  getPublicKey(privateKey: string): string {
    const privKey = Buffer.from(privateKey, "base64");
    const keypair = TweetNACL.box.keyPair.fromSecretKey(privKey);
    return Buffer.from(keypair.publicKey).toString("base64");
  }

  // Check this what does it do
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
    const subnet = Addr(this.ipRange).mask(24).nextSibling().nextSibling();
    return subnet.toString();
  }

  // Check this later
  getNetworksPath() {
    // Check this Should we change to networklight
    return PATH.join(this.config.storePath, "networks");
  }

  // Check this
  async getNetwork() {
    const path = this.getNetworksPath();
    return await this.backendStorage.load(PATH.join(path, this.name, "info.json"));
  }

  private async getMyNetworkContracts(fetch = false) {
    if (fetch || !this.contracts) {
      // Check this Should we change to networklight
      let contracts = await this.tfClient.contracts.listMyNodeContracts({
        graphqlURL: this.config.graphqlURL,
        type: "network",
      });
      const alreadyFetchedContracts: GqlNodeContract[] = [];
      for (const contract of ZNetworkLight.newContracts) {
        // Check this Should we change to networklight
        if (contract.parsedDeploymentData!.type !== "network") continue;
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

  private async getDeploymentContracts(name: string) {
    const contracts = await this.getMyNetworkContracts(true);
    return contracts.filter(c => c.parsedDeploymentData.name === name);
  }

  private getContractsName(contracts: Required<GqlNodeContract>[]): string[] {
    return Array.from(new Set(contracts.map(c => c.parsedDeploymentData.name)));
  }

  private async listNewNetworks() {
    const contracts = await this.getMyNetworkContracts(true);
    return this.getContractsName(contracts);
  }

  private async existOnNewNetwork() {
    return (await this.listNewNetworks()).includes(this.name);
  }

  async getNetworkNames(): Promise<string[]> {
    const newNames = await this.listNewNetworks();

    const path = this.getNetworksPath();
    const oldNames = await this.backendStorage.list(path);
    return Array.from(new Set([...newNames, ...oldNames]));
  }

  isPrivateIP(ip: string): boolean {
    return PrivateIp(ip.split("/")[0]);
  }

  async save(AddedContract?: Contract, deletedContract?: number) {
    if (AddedContract?.contractType.nodeContract)
      ZNetworkLight.newContracts.push({
        contractID: String(AddedContract.contractId),
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
        deploymentData: AddedContract.contractType.nodeContract.deploymentData,
        deploymentHash: AddedContract.contractType.nodeContract.deploymentHash,
        gridVersion: "4",
        id: "",
        nodeID: AddedContract.contractType.nodeContract.nodeId,
        numberOfPublicIPs: AddedContract.contractType.nodeContract.publicIps,
        solutionProviderID: String(AddedContract.solutionProviderId),
        state: ContractStates.Created,
        twinID: String(AddedContract.twinId),
        parsedDeploymentData: JSON.parse(AddedContract.contractType.nodeContract.deploymentData),
        resourcesUsed: undefined,
      });

    if (deletedContract) ZNetworkLight.deletedContracts.push(deletedContract);

    if (!this.node) {
      await this.delete();
    }
  }

  async delete(): Promise<void> {
    events.emit("logs", `Deleting network ${this.name}`);
    const path = PATH.join(this.getNetworksPath(), this.name, "info.json");
    const updateOperations = await this.backendStorage.dump(path, "");
    await this.saveIfKVStoreBackend(updateOperations);
  }
}

export { ZNetworkLight, Node };
