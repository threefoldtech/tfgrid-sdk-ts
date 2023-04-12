import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { FarmerBot, FarmerBotFindNodeModel } from "../high_level/farmerbot";
import { FarmInfo, NodeInfo, NodeResources, Nodes } from "../primitives/nodes";
import {
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

    @expose
    @validateInput
    async filterNodes(options?: FilterOptions): Promise<NodeInfo[]> {
        if (options.farmName) {
            options.farmId = await this.nodes.getFarmIdFromFarmName(options.farmName);
        }
        if (options.farmId) {
            const farmerbot = new FarmerBot(this.config);
            try {
                const pong = await farmerbot.pingFarm({ farmId: options.farmId });
                if (pong) {
                    const nodeOptions: FarmerBotFindNodeModel = {
                        farmId: options.farmId,
                        required_cru: options.cru,
                        required_mru: Math.ceil(this.nodes._g2b(options.mru)) || 0,
                        required_sru: Math.ceil(this.nodes._g2b(options.sru)) || 0,
                        required_hru: Math.ceil(this.nodes._g2b(options.hru)) || 0,
                        certified: options.certified,
                        dedicated: options.dedicated,
                        public_ips: options.publicIPs ? 1 : 0,
                        public_config: options.accessNodeV4 || options.accessNodeV6 || options.gateway,
                        node_exclude: options.nodeExclude,
                    };
                    const nodeId = await farmerbot.findNode(nodeOptions);
                    return [await this.nodes.getNode(nodeId)];
                }
            } catch {
                console.log(`farmer bot is not responding for farm ${options.farmId}`);
            }
        }
        return await this.nodes.filterNodes(options);
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
}

export { Capacity as capacity };
