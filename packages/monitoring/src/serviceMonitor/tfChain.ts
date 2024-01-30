import { KeypairType } from "@polkadot/util-crypto/types";
import { Client as TFClient } from "@threefold/tfchain_client";

import { IDisconnectHandler, ILivenessChecker, ServiceStatus } from "../types";

export class TFChainMonitor implements ILivenessChecker, IDisconnectHandler {
  private name = "TFChain";
  private url: string;
  private tfClient: TFClient;
  constructor(tfChainUrl: string, mnemonic: string, keypairType: KeypairType) {
    this.url = tfChainUrl;
    this.tfClient = new TFClient({ url: this.url, mnemonicOrSecret: mnemonic, keypairType: keypairType });
  }
  private async setUp() {
    await this.tfClient?.connect();
  }
  serviceName() {
    return this.name;
  }
  serviceUrl() {
    return this.url;
  }
  public async isAlive(): Promise<ServiceStatus> {
    try {
      if (!this.tfClient.api) await this.setUp();
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
    await this.tfClient.disconnect();
  }
}
