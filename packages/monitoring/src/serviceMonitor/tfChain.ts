import { KeypairType } from "@polkadot/util-crypto/types";
import { Client as TFClient } from "@threefold/tfchain_client";

import { IDisconnectHandler, ILivenessChecker, ServiceStatus } from "../types";

export class TFChainMonitor implements ILivenessChecker, IDisconnectHandler {
  private _serviceName = "TFChain";
  private _serviceUrl: string;
  private _tfclient: TFClient;
  constructor(tfChainUrl: string, mnemonic: string, keypairType: KeypairType) {
    this._serviceUrl = tfChainUrl;
    this._tfclient = new TFClient({ url: this._serviceUrl, mnemonicOrSecret: mnemonic, keypairType: keypairType });
  }
  private async setUp() {
    await this._tfclient?.connect();
  }
  serviceName() {
    return this._serviceName;
  }
  serviceUrl() {
    return this._serviceUrl;
  }
  public async isAlive(): Promise<ServiceStatus> {
    try {
      if (!this._tfclient.api) await this.setUp();
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
