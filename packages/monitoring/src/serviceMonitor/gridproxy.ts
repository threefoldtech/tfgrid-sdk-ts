import { resolveServiceStatus, sendRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";

export class GridProxyMonitor implements ILivenessChecker {
  private readonly name = "GridProxy";
  private url: string;
  constructor(gridProxyUrl?: string) {
    if (gridProxyUrl) this.url = gridProxyUrl;
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
