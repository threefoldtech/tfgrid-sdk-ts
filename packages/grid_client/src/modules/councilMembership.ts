import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
class CouncilMembership {
  client: TFClient;
  constructor(config: GridClientConfig) {
    this.client = new TFClient(config.substrateURL, config.mnemonic, config.storeSecret, config.keypairType);
  }
  @expose
  @validateInput
  async members() {
    return await this.client.councilMembership.members();
  }
}
export { CouncilMembership as councilMembership };
