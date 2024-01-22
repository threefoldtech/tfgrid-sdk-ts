import { KeypairType } from "@polkadot/util-crypto/types";
import { Client as TFClient } from "@threefold/tfchain_client";

import { IDisconnectHandler, IServiceAliveness, ServiceStatus } from "../types";

export class TFChainMonitor implements IServiceAliveness, IDisconnectHandler {
  public readonly ServiceName = "TFChain";
  private _tfclient: TFClient;
  constructor(TFchainUrl: string, mnemonic: string, keypairType: KeypairType) {
    this._tfclient = new TFClient({ url: TFchainUrl, mnemonicOrSecret: mnemonic, keypairType: keypairType });
  }
  private async setUp() {
    await this._tfclient?.connect();
  }
  public async isAlive(): Promise<ServiceStatus> {
    try {
      if (!this._tfclient.api) await this.setUp();
      console.log(await this._tfclient.api.rpc.system.version());
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
  public async disconnect() {
    await this._tfclient.disconnect();
  }
}
