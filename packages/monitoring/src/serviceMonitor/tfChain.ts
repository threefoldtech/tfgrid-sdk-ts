import { ApiPromise, WsProvider } from "@polkadot/api";

import { IServiceAliveness, ServiceStatus } from "../types";

export class TFChainMonitor implements IServiceAliveness {
  public readonly ServiceName = "TFChain";
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
  public async isAlive(): Promise<ServiceStatus> {
    try {
      if (!this._api) await this.setUp();
      await this._api.rpc.system.version;
      return {
        alive: true,
      };
    } catch (error) {
      return {
        alive: false,
        error,
      };
    }
  }
}
