import { QueryClient } from "@threefold/tfchain_client";

import { IDisconnectHandler, ILivenessChecker, ServiceStatus } from "../types";

export class TFChainMonitor implements ILivenessChecker, IDisconnectHandler {
  private _name = "TFChain";
  private _url: string;
  private _tfClient: QueryClient;
  constructor(tfChainUrl?: string) {
    if (tfChainUrl) {
      this._url = tfChainUrl;
      this._tfClient = new QueryClient(this.url);
    }
  }
  private async setUp() {
    if (!this._tfClient) throw new Error("Can't setUp before initialization");
    await this._tfClient?.connect();
  }
  public get name() {
    return this._name;
  }
  public get url() {
    return this._url ?? "";
  }
  private set url(url: string) {
    this._url = url;
  }
  public update(param: { url: string }): void {
    if (this.url === param.url) return;
    this.url = param.url;
    this._tfClient = new QueryClient(this.url);
  }
  public async isAlive(): Promise<ServiceStatus> {
    if (!this.url) throw new Error("Can't access before initialization");
    try {
      if (!this._tfClient.api) await this.setUp();
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
    await this._tfClient.disconnect();
  }
}
