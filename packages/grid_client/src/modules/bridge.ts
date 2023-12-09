import { TFClient } from "../clients";
import { GridClientConfig } from "../config";
import { expose, validateInput } from "../helpers";
import { ListenToMintCompletedModel, SwapToStellarModel } from "./models";

class Bridge {
  client: TFClient;
  constructor(public config: GridClientConfig) {
    this.client = config.tfclient;
  }

  @expose
  @validateInput
  async listenToMintCompleted(options: ListenToMintCompletedModel) {
    return await this.client.tftBridge.listenToMintCompleted(options.address);
  }

  @expose
  @validateInput
  async getWithdrawFee() {
    return await this.client.tftBridge.getWithdrawFee();
  }

  @expose
  @validateInput
  async getDepositFee() {
    return await this.client.tftBridge.getDepositFee();
  }

  @expose
  @validateInput
  async swapToStellar(options: SwapToStellarModel) {
    return await (await this.client.tftBridge.swapToStellar(options)).apply();
  }
}

export { Bridge as bridge };
