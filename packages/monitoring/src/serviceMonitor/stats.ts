import { resolveServiceStatus, sendRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";

export class StatsMonitor implements ILivenessChecker {
  private readonly _name = "Stats";
  private _url: string;
  constructor(statusUrl?: string) {
    if (statusUrl) this.url = statusUrl;
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
    this.url = param.url;
  }
  async isAlive(url = this.url): Promise<ServiceStatus> {
    if (!url) throw new Error("Can't access before initialization");
    return resolveServiceStatus(sendRequest(`${url}/api/stats-summary`, { method: "Get" }));
  }
}
