import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { FarmerBot, FarmerBotFindNodeModel } from "../high_level/farmerbot";
import { FarmInfo, NodeInfo, NodeResources, Nodes } from "../primitives/nodes";
import {
  CapacityPoolCheckModel,
  FarmFilterOptions,
  FarmHasFreePublicIPsModel,
  FarmIdFromFarmNameModel,
  FarmsGetModel,
  FilterOptions,
  NodeFreeResourcesModel,
  NodesByFarmIdModel,
  NodesGetModel,
} from "./models";

class Capacity {
  nodes: Nodes;
  constructor(public config: GridClientConfig) {
    this.nodes = new Nodes(config.graphqlURL, config.proxyURL, config.rmbClient);
  }
  @expose
  @validateInput
  async getFarms(options: FarmsGetModel = {}): Promise<FarmInfo[]> {
    return await this.nodes.getFarms(options.page, options.maxResult);
  }

  @expose
  @validateInput
  async getNodes(options: NodesGetModel = {}): Promise<NodeInfo[]> {
    return await this.nodes.getNodes(options.page, options.maxResult);
  }

  @expose
  async getAllFarms(): Promise<FarmInfo[]> {
    return await this.nodes.getAllFarms();
  }

  @expose
  async getAllNodes(): Promise<NodeInfo[]> {
    return await this.nodes.getAllNodes();
  }

  private async useFarmerBot(options?: FilterOptions): Promise<NodeInfo[]> {
    if (options) {
      const farmerbot = new FarmerBot(this.config);
      try {
        const pong = await farmerbot.pingFarm({ farmId: options.farmId! });
        if (pong && options.mru && options.sru && options.hru && options.hasGPU) {
          const nodeOptions: FarmerBotFindNodeModel = {
            farmId: options.farmId!,
            required_cru: options.cru,
            required_mru: Math.ceil(this.nodes._g2b(options.mru)) || 0,
            required_sru: Math.ceil(this.nodes._g2b(options.sru)) || 0,
            required_hru: Math.ceil(this.nodes._g2b(options.hru)) || 0,
            certified: options.certified,
            dedicated: options.dedicated,
            public_ips: options.publicIPs ? 1 : 0,
            public_config: options.accessNodeV4 || options.accessNodeV6 || options.gateway,
            node_exclude: options.nodeExclude,
            has_gpus: options.hasGPU ? 0 : 1,
          };
          const nodeId = await farmerbot.findNode(nodeOptions);
          return [await this.nodes.getNode(nodeId)];
        }
      } catch {
        console.log(`farmer bot is not responding for farm ${options.farmId}`);
      }
    }
    return [];
  }

  @expose
  @validateInput
  async filterNodes(options?: FilterOptions): Promise<NodeInfo[]> {
    // Disabling farmer bot as some filters are not supported yet there.

    let nodes: NodeInfo[] = [];
    // if (options?.farmName) {
    //   options.farmId = await this.nodes.getFarmIdFromFarmName(options.farmName);
    // }
    // if (options?.farmId && !options.rentedBy) {
    //   nodes = await this.useFarmerBot(options)
    // }
    if (nodes.length <= 0) nodes = await this.nodes.filterNodes(options);
    return nodes;
  }

  @expose
  @validateInput
  async filterFarms(options?: FarmFilterOptions): Promise<FarmInfo[]> {
    return await this.nodes.filterFarms(options);
  }

  @expose
  @validateInput
  async checkFarmHasFreePublicIps(options?: FarmHasFreePublicIPsModel): Promise<boolean> {
    return await this.nodes.checkFarmHasFreePublicIps(options.farmId);
  }

  @expose
  @validateInput
  async getNodesByFarmId(options?: NodesByFarmIdModel): Promise<NodeInfo[]> {
    return await this.nodes.filterNodes({ farmId: options.farmId });
  }

  @expose
  @validateInput
  async getNodeFreeResources(options?: NodeFreeResourcesModel): Promise<NodeResources> {
    return await this.nodes.getNodeFreeResources(options.nodeId);
  }

  @expose
  @validateInput
  async getFarmIdFromFarmName(options?: FarmIdFromFarmNameModel): Promise<number> {
    return await this.nodes.getFarmIdFromFarmName(options.farmName);
  }

  /**
   * Checks the storage pool capacity of a node for different disk types.
   *
   * @param options - An object containing the required disk sizes and node ID for capacity pool check.
   * @param options.ssdDisks - An array of SSD disk sizes (in bytes) required for the node.
   * @param options.hddDisks - An array of HDD disk sizes (in bytes) required for the node.
   * @param options.rootfsDisks - An array of disk sizes (in bytes) required for the node's root file system.
   * @param options.nodeId - The ID of the node to be verified.
   * @returns {Promise<boolean>} - True if the node has enough capacity, otherwise false.
   * @throws {Error} - If there is an error in getting the node's information or if the required deployment can't be fitted.
   */
  @expose
  @validateInput
  async checkNodeCapacityPool(options: CapacityPoolCheckModel): Promise<boolean> {
    return await this.nodes.verifyNodeStoragePoolCapacity(
      options.ssdDisks,
      options.hddDisks,
      options.rootfsDisks,
      options.nodeId,
    );
  }
}

export { Capacity as capacity };
