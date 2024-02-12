import { QueryClient } from "@threefold/tfchain_client";

import { IDisconnectHandler, ILivenessChecker, ServiceStatus } from "../types";

export class TFChainMonitor implements ILivenessChecker, IDisconnectHandler {
  private name = "TFChain";
  private url: string;
  private tfClient: QueryClient;
  constructor(tfChainUrl: string) {
    this.url = tfChainUrl;
    this.tfClient = new QueryClient(this.url);
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
