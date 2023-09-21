import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { DaoVoteModel } from "./models";
class Dao {
  client: TFClient;
  constructor(config: GridClientConfig) {
    this.client = new TFClient(config.substrateURL, config.mnemonic, config.storeSecret, config.keypairType);
  }
  @expose
  @validateInput
  async get() {
    return await this.client.dao.get();
  }
  @expose
  @validateInput
  async vote(options: DaoVoteModel) {
    return (await this.client.dao.vote(options)).apply();
  }
}
export { Dao as dao };
