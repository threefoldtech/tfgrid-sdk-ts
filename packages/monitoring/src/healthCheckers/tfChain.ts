import { ApiPromise, WsProvider } from "@polkadot/api";
import { TFChainError } from "@threefold/types";

import { HealthCheck } from "./healthChecker";

export class TFChainHealthCheck extends HealthCheck {
  private _api: ApiPromise;
  constructor(public pingUrl: string) {
    super(pingUrl, "TFChain");
  }
  private async setUp() {
    const provider = new WsProvider(this.pingUrl, false);
    await provider.connect();
    this._api = await ApiPromise.create({ provider, throwOnConnect: true });
  }
  public async alive(): Promise<boolean> {
    try {
      if (!this._api) await this.setUp();
      await this._api.rpc.system.version;
      return true;
    } catch (err) {
      throw new TFChainError(`Failed to set up a TFChain connection`);
    }
  }
}
