import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { BatchModel } from "./models";
import { checkBalance } from "./utils";

interface Extrinsic {
    extrinsic: [];
}

class Utility {
    client: TFClient;

    constructor(public config: GridClientConfig) {
        this.client = new TFClient(config.substrateURL, config.mnemonic, config.storeSecret, config.keypairType);
    }

    @expose
    @checkBalance
    async batch(options: BatchModel) {
        return await this.client.utility.batch(options.extrinsics);
    }

    @expose
    @checkBalance
    async batchAll(options: BatchModel) {
        return await this.client.utility.batchAll(options.extrinsics);
    }
}

export { Utility as utility };
