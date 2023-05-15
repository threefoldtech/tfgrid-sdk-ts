import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
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
  async batch<T>(options: BatchModel<T>) {
    return await this.client.utility.batch(options.extrinsics);
  }

  @expose
  @checkBalance
  async batchAll<T>(options: BatchModel<T>) {
    return await this.client.utility.batchAll(options.extrinsics);
  }
}

export { Utility as utility };
