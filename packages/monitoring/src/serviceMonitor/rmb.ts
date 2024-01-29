import { KeypairType } from "@polkadot/util-crypto/types";
import { Client as RMBClient } from "@threefold/rmb_direct_client";

import { generateString, resolveServiceStatus } from "../helpers/utils";
import { IDisconnectHandler, ILivenessChecker, ServiceStatus } from "../types";

export class RMBMonitor implements ILivenessChecker, IDisconnectHandler {
  private _serviceName = "RMB";
  private _serviceURL: string;
  private rmbClient: RMBClient;
  constructor(relayUrl: string, chainUrl: string, mnemonic: string, keypairType: KeypairType) {
    this._serviceURL = relayUrl;
    this.rmbClient = new RMBClient(chainUrl, relayUrl, mnemonic, generateString(10), keypairType, 0);
  }
  private async setUp() {
    await this.rmbClient.connect();
  }
  public serviceName() {
    return this._serviceName;
  }
  public serviceUrl() {
    return this._serviceURL;
  }
  public async isAlive(): Promise<ServiceStatus> {
    if (!this.rmbClient?.con?.OPEN) await this.setUp();
    return resolveServiceStatus(this.rmbClient.ping(2));
  }
  public async disconnect() {
    await this.rmbClient.disconnect();
  }
}
