import { KeypairType } from "@polkadot/util-crypto/types";
import { Client as RMBClient } from "@threefold/rmb_direct_client";

import { generateString, resolveServiceStatus } from "../helpers/utils";
import { IDisconnectHandler, ILivenessChecker, ServiceStatus } from "../types";

export class RMBMonitor implements ILivenessChecker, IDisconnectHandler {
  private name = "RMB";
  private url: string;
  private rmbClient: RMBClient;
  constructor(relayUrl: string, chainUrl: string, mnemonic: string, keypairType: KeypairType) {
    this.url = relayUrl;
    this.rmbClient = new RMBClient(chainUrl, relayUrl, mnemonic, generateString(10), keypairType, 0);
  }
  private async setUp() {
    await this.rmbClient.connect();
  }
  public serviceName() {
    return this.name;
  }
  public serviceUrl() {
    return this.url;
  }
  async updateUrl(url: string) {
    await this.disconnect();
    this.url = url;
    this.rmbClient.relayUrl = url;
  }
  public async isAlive(): Promise<ServiceStatus> {
    try {
      if (!this.rmbClient?.con?.OPEN) await this.setUp();
      return resolveServiceStatus(this.rmbClient.ping(2));
    } catch (error) {
      return { alive: false, error };
    }
  }
  public async disconnect() {
    await this.rmbClient.disconnect();
  }
}
