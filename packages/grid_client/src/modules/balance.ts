import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { BalanceGetModel, BalanceTransferModel } from "./models";
import { checkBalance } from "./utils";

class Balance {
  client: TFClient;
  constructor(config: GridClientConfig) {
    this.client = new TFClient(config.substrateURL, config.mnemonic, config.storeSecret, config.keypairType);
  }
  @expose
  @validateInput
  async get(options: BalanceGetModel) {
    return await this.client.balances.get(options);
  }
  @expose
  @validateInput
  @checkBalance
  async transfer(options: BalanceTransferModel) {
    return await (await this.client.balances.transfer(options)).apply();
  }

  @expose
  @validateInput
  async getMyBalance() {
    return await this.client.balances.getMyBalance();
  }
}

export { Balance as balance };
