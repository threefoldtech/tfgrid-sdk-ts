import { Client as RMBClient } from "@threefold/rmb_direct_client";

import { generateString, resolveServiceStatus } from "../helpers/utils";
import { IDisconnectHandler, ILivenessChecker, RMBProps, ServiceStatus } from "../types";

export class RMBMonitor implements ILivenessChecker, IDisconnectHandler {
  private name = "RMB";
  private rmbClient: RMBClient;
  constructor(private RMBProps: RMBProps) {
    if (RMBProps) this.factory();
  }

  /*
    Creates a new RMB Client instance
  */
  private factory() {
    const { chainUrl, relayUrl, mnemonics, keypairType } = this.RMBProps;
    if (relayUrl) {
      this.rmbClient = new RMBClient(chainUrl, relayUrl, mnemonics, generateString(10), keypairType, 0);
    }
  }

  private async setUp() {
    if (!this.rmbClient) throw new Error("Can't setUp before initialization");
    await this.rmbClient.connect();
  }
  public get Name() {
    return this.name;
  }
  public get URL() {
    if (!this.RMBProps.relayUrl) throw new Error("Can't access before initialization");
    return this.RMBProps.relayUrl;
  }
  public set URL(url: string) {
    async () => {
      this.RMBProps.relayUrl = url;
      if (this.rmbClient) {
        await this.disconnect();
        this.rmbClient.relayUrl = this.RMBProps.relayUrl;
      } else this.factory();
    };
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
