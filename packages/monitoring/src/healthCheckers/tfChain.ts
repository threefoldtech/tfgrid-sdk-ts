import { ApiPromise, WsProvider } from "@polkadot/api";
import { ILivenessChecker } from "src/types";

export class TFChainHealthCheck implements ILivenessChecker {
  public ServiceName: "TFChain";
  public ServiceURL: string;
  private _api: ApiPromise;
  constructor(TFchainUrl: string) {
    this.ServiceURL = TFchainUrl;
  }
  private async setUp() {
    const provider = new WsProvider(this.ServiceURL, false);
    await provider.connect();
    this._api = await ApiPromise.create({ provider, throwOnConnect: true });
  }
  public async LiveChecker(): Promise<boolean> {
    try {
      if (!this._api) await this.setUp();
      await this._api.rpc.system.version;
      return true;
    } catch (err) {
      //TODO stream errors
      console.log(err);
      return false;
    }
  }
}
