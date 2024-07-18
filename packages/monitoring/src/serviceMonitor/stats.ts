import { resolveServiceStatus, sendRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";

export class StatsMonitor implements ILivenessChecker {
  private readonly name = "Stats";
  private url: string;
  constructor(statusUrl?: string) {
    if (statusUrl) this.url = statusUrl;
  }
  public get Name() {
    return this.name;
  }
  public get URL() {
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
