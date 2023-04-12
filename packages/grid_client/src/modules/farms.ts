import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { FarmIdModel } from "./models";

class Farms {
    client: TFClient;

    constructor(public config: GridClientConfig) {
        this.client = new TFClient(config.substrateURL, config.mnemonic, config.storeSecret, config.keypairType);
    }

    @expose
    @validateInput
    async getFarmByID(options: FarmIdModel) {
        return await this.client.farms.getFarmByID(options.farmId);
    }
}

export { Farms as farms };
