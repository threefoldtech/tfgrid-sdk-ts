import { resolveServiceStatus, sendRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";

export class ActivationMonitor implements ILivenessChecker {
  private readonly name = "Activation";
  private url: string;
  constructor(activationServiceUrl: string) {
    this.url = activationServiceUrl;
  }
  public get Name() {
    return this.name;
  }
  public get URL() {
    return this.url;
  }
  public set URL(url: string) {
    this.url = url;
  }
  async isAlive(): Promise<ServiceStatus> {
    return resolveServiceStatus(sendRequest(this.url, { method: "Get" }));
  }
}
