import { ValidationError } from "@threefold/types";
import { Addr } from "netaddr";
import * as PATH from "path";

import { GridClientConfig } from "../config";
import { MyceliumNetworkModel } from "../modules";
import { DeploymentFactory, Network, UserAccess } from "../primitives";
import { BackendStorage } from "../storage";
import { WorkloadTypes, Znet } from "../zos";
import { HighLevelBase } from "./base";
import { Operations, TwinDeployment } from "./models";

class NetworkHL extends HighLevelBase {
  backendStorage: BackendStorage;
  constructor(public config: GridClientConfig) {
    super(config);
    this.backendStorage = new BackendStorage(
      config.backendStorageType,
      config.substrateURL,
      config.mnemonic,
      config.storeSecret,
      config.keypairType,
      config.backendStorage,
      config.seed,
    );
  }

  async addNode(
    networkName: string,
    ipRange: string,
    nodeId: number,
    solutionProviderId: number,
    mycelium: boolean,
    description = "",
    subnet = "",
    myceliumNetworkSeeds: MyceliumNetworkModel[] = [],
  ) {
    const network = new Network(networkName, ipRange, this.config);
    await network.load();
    const contractMetadata = JSON.stringify({
      version: 3,
      type: "network",
      name: networkName,
      projectName: this.config.projectName,
    });

    const workload = await network.addNode(nodeId, mycelium, description, subnet, myceliumNetworkSeeds);
    if (!workload) {
      throw new ValidationError(`Node ${nodeId} already exists on network ${networkName}.`);
    }

    const twinDeployments: TwinDeployment[] = [];
    const deploymentFactory = new DeploymentFactory(this.config);
    const deployment = deploymentFactory.create([workload], 0, contractMetadata, description, 0);
    twinDeployments.push(
      new TwinDeployment(deployment, Operations.deploy, 0, nodeId, contractMetadata, network, solutionProviderId, true),
    );

    if (!(await network.exists())) {
      return twinDeployments;
    }
    // update network if it's already exist
    for (const deployment of network.deployments) {
      const d = await deploymentFactory.fromObj(deployment);
      for (const workload of d.workloads) {
        const data = workload.data as Znet;
        if (workload.type !== WorkloadTypes.network || !Addr(network.ipRange).contains(Addr(data.subnet))) {
          continue;
        }
        workload.data = network.getUpdatedNetwork(data);
        workload.version += 1;
        break;
      }
      twinDeployments.push(
        new TwinDeployment(d, Operations.update, 0, 0, contractMetadata, network, solutionProviderId, true),
      );
    }
    return twinDeployments;
  }

  async hasNode(networkName: string, ipRange: string, nodeId: number): Promise<boolean> {
    const network = new Network(networkName, ipRange, this.config);
    await network.load();
    return network.nodeExists(nodeId);
  }

  async getWireguardConfigs(networkName: string, ipRange: string, nodeId?: number): Promise<string[]> {
    const configs: string[] = [];
    const network = new Network(networkName, ipRange, this.config);
    await network.load();
    if (nodeId && !network.nodeExists(nodeId)) {
      return configs;
    }
    let userAccesses: UserAccess[] = network.userAccesses;
    if (network.userAccesses && network.userAccesses.length > 0) {
      if (nodeId && network.nodeExists(nodeId)) {
        userAccesses = network.userAccesses.filter(userAccess => userAccess.node_id === nodeId);
      }
      for (const userAccess of userAccesses) {
        const nodesWGPubkey = await network.getNodeWGPublicKey(userAccess.node_id);
        const endpoint = await network.getAccessNodeEndpoint(userAccess.node_id);
        configs.push(network.getWireguardConfig(userAccess.subnet, userAccess.private_key, nodesWGPubkey, endpoint));
      }
      return configs;
    } else {
      const path = PATH.join(this.config.storePath, "networks", networkName, "info.json");
      const networkInfo = await this.backendStorage.load(path);
      return networkInfo["wireguardConfigs"];
    }
  }
}

export { NetworkHL };
