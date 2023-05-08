import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { TwinCreateModel, TwinDeleteModel, TwinGetByAccountIdModel, TwinGetModel } from "./models";
import { checkBalance } from "./utils";

class Twins {
  client: TFClient;
  constructor(config: GridClientConfig) {
    this.client = new TFClient(config.substrateURL, config.mnemonic, config.storeSecret, config.keypairType);
  }

  @expose
  @validateInput
  @checkBalance
  async create(options: TwinCreateModel) {
    return (await this.client.twins.create(options)).apply();
  }

  @expose
  @validateInput
  @checkBalance
  async update(options: TwinCreateModel) {
    return (await this.client.twins.update(options)).apply();
  }

  @expose
  @validateInput
  async get(options: TwinGetModel) {
    return await this.client.twins.get(options);
  }

  @expose
  @validateInput
  async get_my_twin_id() {
    return await this.client.twins.getMyTwinId();
  }

  @expose
  @validateInput
  async get_twin_id_by_account_id(options: TwinGetByAccountIdModel) {
    return await this.client.twins.getTwinIdByAccountId({ accountId: options.public_key });
  }
}

export { Twins as twins };
