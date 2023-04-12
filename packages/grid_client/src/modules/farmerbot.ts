import { RMB } from "../clients/rmb";
import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { FarmerBot, FarmerBotFindNodeModel } from "../high_level/farmerbot";
import { Nodes } from "../primitives";
import { pingFarmModel } from "./models";

class Farmerbot {
    client: TFClient;
    nodes: Nodes;
    farmerBot: FarmerBot;
    rmb: RMB;

    constructor(public config: GridClientConfig) {
        this.client = new TFClient(config.substrateURL, config.mnemonic, config.storeSecret, config.keypairType);
        this.farmerBot = new FarmerBot(this.config);
        this.rmb = new RMB(config.rmbClient);
    }

    @expose
    @validateInput
    async pingFarm(options: pingFarmModel) {
        return await this.farmerBot.pingFarm(options);
    }

    @expose
    @validateInput
    async findNode(options: FarmerBotFindNodeModel) {
        return await this.farmerBot.findNode(options);
    }
}

export { Farmerbot as farmerbot };
