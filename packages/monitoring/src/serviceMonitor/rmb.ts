import { Client as RMBClient } from "@threefold/rmb_direct_client";

import { generateString, resolveServiceStatus } from "../helpers/utils";
import { IDisconnectHandler, ILivenessChecker, RMBProps, ServiceStatus } from "../types";

export class RMBMonitor implements ILivenessChecker, IDisconnectHandler {
  private _name = "RMB";
  private _rmbClient: RMBClient;
  constructor(private _rmbProps: RMBProps) {
    if (_rmbProps) this.factory();
  }

  /*
    Creates a new RMB Client instance
  */
  private factory() {
    const { chainUrl, relayUrl, mnemonics, keypairType } = this._rmbProps;
    if (relayUrl) {
      this._rmbClient = new RMBClient(chainUrl, relayUrl, mnemonics, generateString(10), keypairType, 0);
    }
  }

  private async setUp() {
    if (!this._rmbClient) throw new Error("Can't setUp before initialization");
    await this._rmbClient?.connect();
  }
  public get name() {
    return this._name;
  }
  public get url() {
    return this._rmbProps?.relayUrl ?? "";
  }
  private set url(url: string) {
    this._rmbProps.relayUrl = url;
  }

  public async update(param: { url: string }) {
    if (this.url === param.url) return;
    this.url = param.url;
    if (this._rmbClient) {
      await this.disconnect();
      this._rmbClient.relayUrl = this.url;
    } else this.factory();
  }

  public async isAlive(): Promise<ServiceStatus> {
    if (!this.url) throw new Error("Can't access before initialization");
    try {
      if (!this._rmbClient?.con?.OPEN) await this.setUp();
      return resolveServiceStatus(this._rmbClient.ping(2));
    } catch (error) {
      return { alive: false, error };
    }
  }
  public async disconnect() {
    await this._rmbClient.disconnect();
  }
}
