import { QueryClient } from "@threefold/tfchain_client";

import { IDisconnectHandler, ILivenessChecker, ServiceStatus } from "../types";

export class TFChainMonitor implements ILivenessChecker, IDisconnectHandler {
  private name = "TFChain";
  private url: string;
  private tfClient: QueryClient;
  constructor(tfChainUrl: string) {
    if (tfChainUrl) {
      this.url = tfChainUrl;
      this.tfClient = new QueryClient(this.url);
    }
  }
  private async setUp() {
    if (!this.tfClient) throw new Error("Can't setUp before initialization");
    await this.tfClient?.connect();
  }
  public get Name() {
    return this.name;
  }
  public get URL() {
    if (!this.url) throw new Error("Can't access before initialization");
    return this.url;
  }
  public set URL(url: string) {
    this.url = url;
    this.tfClient = new QueryClient(this.url);
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
