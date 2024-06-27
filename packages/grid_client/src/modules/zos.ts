import { RMB } from "../clients/rmb/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { DeploymentResultContracts, Operations, TwinDeployment } from "../high_level/models";
import { TwinDeploymentHandler } from "../high_level/twinDeploymentHandler";
import { DeploymentFactory } from "../primitives/deployment";
import { Nodes } from "../primitives/nodes";
import { WorkloadTypes } from "../zos/workload";
import {
  GPUCardInfo,
  NodeCPUTest,
  NodeIPerf,
  NodeIPValidation,
  PingNodeOptionsModel,
  ZOSGetDeploymentModel,
  ZOSModel,
  ZOSNodeModel,
} from "./models";
import { checkBalance } from "./utils";

class Zos {
  rmb: RMB;
  capacity: Nodes;

  /**
   * Class representing the ZOS functionality.
   *
   * @param {GridClientConfig} config - The configuration object for initializing the client.
   */
  constructor(public config: GridClientConfig) {
    this.rmb = new RMB(config.rmbClient);
    this.capacity = new Nodes(this.config.graphqlURL, this.config.proxyURL, this.config.rmbClient);
  }

  /**
   * Deploy a workload on a node.
   *
   * @param {ZOSModel} options - The options for the deployment.
   * @returns {Promise<DeploymentResultContracts>} - The result of the deployment.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance before proceeding.
   */
  @expose
  @validateInput
  @checkBalance
  async deploy(options: ZOSModel): Promise<DeploymentResultContracts> {
    // get node_id from the deployment
    const node_id = options.node_id;
    delete options.node_id;

    const deploymentFactory = new DeploymentFactory(this.config);
    const deployment = await deploymentFactory.fromObj(options);

    let publicIps = 0;
    for (const workload of deployment.workloads) {
      if (workload.type === WorkloadTypes.ip && workload.data["v4"]) {
        publicIps++;
      }
    }
    console.log(`Deploying on node_id: ${node_id} with number of public IPs: ${publicIps}`);
    const twinDeployment = new TwinDeployment(deployment, Operations.deploy, publicIps, node_id, deployment.metadata);
    const twinDeploymentHandler = new TwinDeploymentHandler(this.config);
    return await twinDeploymentHandler.handle([twinDeployment]);
  }

  /**
   * Ping a node to check its availability.
   *
   * @param {PingNodeOptionsModel} options - The options for pinging the node.
   * @returns {Promise<boolean>} - A boolean indicating if the node is reachable.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async pingNode(options: PingNodeOptionsModel): Promise<boolean> {
    const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
    return await this.rmb.request([nodeTwinId], "zos.system.version", "", 10, 1);
  }

  /**
   * Get deployment information based on the contract ID.
   *
   * @param {ZOSGetDeploymentModel} options - The options for getting deployment information.
   * @returns {Promise<any>} - A promise that resolves with the deployment information.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getDeployment(options: ZOSGetDeploymentModel): Promise<any> {
    const nodeId = await this.capacity.getNodeIdFromContractId(options.contractId, this.config.substrateURL);
    const nodeTwinId = await this.capacity.getNodeTwinId(nodeId);
    const payload = JSON.stringify({ contract_id: options.contractId });
    return await this.rmb.request([nodeTwinId], "zos.deployment.get", payload);
  }

  /**
   * Get statistics for a specific node.
   *
   * @param {ZOSNodeModel} options - The options for getting node statistics.
   * @returns {Promise<any>} - A promise that resolves with the node statistics.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getNodeStatistics(options: ZOSNodeModel): Promise<any> {
    const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
    return await this.rmb.request([nodeTwinId], "zos.statistics.get", "");
  }

  /**
   * Check if a node has a public IPv6 address.
   *
   * @param {ZOSNodeModel} options - The options containing the node ID.
   * @returns {Promise<boolean>} - A promise that resolves with a boolean indicating if the node has a public IPv6 address.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async hasPublicIPv6(options: ZOSNodeModel): Promise<boolean> {
    const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
    return await this.rmb.request([nodeTwinId], "zos.network.has_ipv6", "");
  }

  /**
   * List network interfaces for a specific node.
   *
   * @param {ZOSNodeModel} options - The options containing the node ID.
   * @returns {Promise<any>} - A promise that resolves with the network interfaces information.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async listNetworkInterfaces(options: ZOSNodeModel): Promise<any> {
    const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
    return await this.rmb.request([nodeTwinId], "zos.network.interfaces", "");
  }

  /**
   * List the public IP addresses associated with a specific node.
   *
   * @param {ZOSNodeModel} options - The options containing the node ID.
   * @returns {Promise<any>} - A promise that resolves with the list of public IP addresses.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async listNetworkPublicIPs(options: ZOSNodeModel): Promise<any> {
    const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
    return await this.rmb.request([nodeTwinId], "zos.network.list_public_ips", "");
  }

  /**
   * Get the public network configuration for a specific node.
   *
   * @param {ZOSNodeModel} options - The options containing the node ID.
   * @returns {Promise<any>} - A promise that resolves with the public network configuration.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getNetworkPublicConfig(options: ZOSNodeModel): Promise<any> {
    const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
    return await this.rmb.request([nodeTwinId], "zos.network.public_config_get", "");
  }

  /**
   * Get the storage pools information for a specific node.
   *
   * @param {ZOSNodeModel} options - The options containing the node ID.
   * @returns {Promise<any>} - A promise that resolves with the storage pools information.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getStoragePools(options: ZOSNodeModel): Promise<any> {
    const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
    return await this.rmb.request([nodeTwinId], "zos.storage.pools", "");
  }

  /**
   * Get GPU information for a specific node.
   *
   * @param {ZOSNodeModel} options - The options containing the node ID.
   * @returns {Promise<GPUCardInfo[]>} - A promise that resolves with an array of GPU card information.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getNodeGPUInfo(options: ZOSNodeModel): Promise<GPUCardInfo[]> {
    const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
    return await this.rmb.request([nodeTwinId], "zos.gpu.list", "");
  }

  /**
   * Get performance tests for a specific node.
   *
   * @param {ZOSNodeModel} options - The options containing the node ID.
   * @returns {Promise<any>} - A promise that resolves with the performance test results.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getNodePerfTests(options: ZOSNodeModel): Promise<any> {
    const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
    return await this.rmb.request([nodeTwinId], "zos.perf.get_all", "");
  }

  /**
   * Get the IPerf test results for a specific node.
   *
   * @param {ZOSNodeModel} options - The options containing the node ID.
   * @returns {Promise<NodeIPerf>} - A promise that resolves with the IPerf test results.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getNodeIPerfTest(options: ZOSNodeModel): Promise<NodeIPerf> {
    const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
    const payload = JSON.stringify({ name: "iperf" });
    return await this.rmb.request([nodeTwinId], "zos.perf.get", payload);
  }

  /**
   * Get the IP validation test results for a specific node.
   *
   * @param {ZOSNodeModel} options - The options containing the node ID.
   * @returns {Promise<NodeIPValidation>} - A promise that resolves with the IP validation test results.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getNodeIPValidation(options: ZOSNodeModel): Promise<NodeIPValidation> {
    const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
    const payload = JSON.stringify({ name: "public-ip-validation" });
    return await this.rmb.request([nodeTwinId], "zos.perf.get", payload);
  }

  /**
   * Get CPU test results for a specific node.
   *
   * @param {ZOSNodeModel} options - The options containing the node ID.
   * @returns {Promise<NodeCPUTest>} - A promise that resolves with the CPU test results.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getNodeCPUTest(options: ZOSNodeModel): Promise<NodeCPUTest> {
    const nodeTwinId = await this.capacity.getNodeTwinId(options.nodeId);
    const payload = JSON.stringify({ name: "cpu-benchmark" });
    return await this.rmb.request([nodeTwinId], "zos.perf.get", payload);
  }
}

export { Zos as zos };
