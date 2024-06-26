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

  /**
   * The `NetworkHL` class provides high-level network operations.
   *
   * Initializes a new instance of the `NetworkHL` class.
   *
   * @param {GridClientConfig} config - The grid client configuration.
   */
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

  /**
   * Adds a node to a network.
   *
   * This method is responsible for adding a node to a specified network using the provided params.
   * It proceeds to add the node to the network.
   *
   * @param {string} networkName - The name of the network.
   * @param {string} ipRange - The IP range for the network.
   * @param {number} nodeId - The ID of the node to be added.
   * @param {number | undefined} solutionProviderId - The ID of the solution provider (optional).
   * @param {boolean} mycelium - Indicates whether mycelium is used.
   * @param {string | undefined} description - The description of the node (optional).
   * @param {string | undefined} myceliumNetworkSeeds - The seed for mycelium (optional).
   *
   * @returns {Promise<TwinDeployment[]>} A promise that resolves to an object containing the deployment result.
   *
   * @example
   *
   * const result = await networkModule.addNode(
   *   name: "exampleNetwork",
   *   ipRange: "10.0.0.0/16",
   *   nodeId: 123,
   *   solutionProviderId: 1,
   *   mycelium: true,
   *   description: "Example node",
   *   myceliumSeed: "seed123",
   * );
   * console.log(result);
   *
   */
  async addNode(
    networkName: string,
    ipRange: string,
    nodeId: number,
    solutionProviderId: number,
    mycelium: boolean,
    description: string | undefined = "",
    subnet = "",
    myceliumNetworkSeeds: MyceliumNetworkModel[] = [],
  ): Promise<TwinDeployment[]> {
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

  /**
   * Checks if a node exists in the network based on the specified params.
   *
   * This method checks if a node with the specified id exists within the network associated with the current configuration.
   *
   * @param {string} networkName - The name of the network.
   * @param {string} ipRange - The IP range of the network.
   * @param {number} nodeId - The ID of the node to check.
   *
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the node exists in the network.
   *
   * @example
   * const networkHL = new NetworkHL()
   * const doesNodeExist = await networkHL.hasNode("exampleNetwork", "10.0.0.0/16", 123);
   * console.log(doesNodeExist); // true or false
   */
  async hasNode(networkName: string, ipRange: string, nodeId: number): Promise<boolean> {
    const network = new Network(networkName, ipRange, this.config);
    await network.load();
    return network.nodeExists(nodeId);
  }

  /**
   * Retrieves WireGuard configurations for a network based on the specified options.
   *
   * This method retrieves the WireGuard configurations for the specified network name and IP range.
   *
   * @param {string} networkName - The name of the network.
   * @param {string} ipRange - The IP range of the network.
   *
   * @returns {Promise<string[]>} A promise that resolves to an array of WireGuard configuration strings.
   *
   * @example
   * const networkHL = new NetworkHL()
   * const wireGuardConfigs = await networkHL.getWireGuardConfigs("exampleNetwork", "10.0.0.0/16");
   * console.log(wireGuardConfigs); // ["config1", "config2", ...]
   */
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
      return networkInfo["wireguardConfigs"] || [];
    }
  }
}

export { NetworkHL };
