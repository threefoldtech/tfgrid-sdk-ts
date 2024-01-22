import { KeypairType } from "@polkadot/util-crypto/types";
import { Client as RMBClient } from "@threefold/rmb_direct_client";

import { generateString } from "../helpers/utils";
import { IServiceAliveness, ServiceStatus } from "../types";

export class RMBMonitor implements IServiceAliveness {
  public readonly ServiceName = "RMB";
  public ServiceURL: string;
  private rmbClient: RMBClient;
  constructor(public relayUrl: string, chainUrl: string, mnemonic: string, keypairType: KeypairType) {
    this.ServiceURL = relayUrl;
    this.rmbClient = new RMBClient(chainUrl, relayUrl, mnemonic, generateString(10), keypairType, 0);
  }
  private async setUp() {
    try {
      await this.rmbClient.connect();
    } catch (e) {
      console.log(e);
    }
  }
  public async isAlive(): Promise<ServiceStatus> {
    try {
      if (!this.rmbClient?.con?.OPEN) await this.setUp();
      await this.rmbClient.ping(2);
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
