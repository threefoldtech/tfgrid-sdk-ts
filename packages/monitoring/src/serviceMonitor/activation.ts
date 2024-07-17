import { resolveServiceStatus, sendRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";

export class ActivationMonitor implements ILivenessChecker {
  private readonly name = "Activation";
  private url: string;
  constructor(activationServiceUrl?: string) {
    if (activationServiceUrl) this.url = activationServiceUrl;
  }
  public get Name() {
    return this.name;
  }
  public get URL() {
    if (!this.url) throw new Error("Can't access before initialization");
    return this.url;
  }
  private set URL(url: string) {
    this.url = url;
  }
  public update(param: { url: string }): void {
    this.URL = param.url;
  }
  async isAlive(): Promise<ServiceStatus> {
    return resolveServiceStatus(sendRequest(this.url, { method: "Get" }));
  }
}
