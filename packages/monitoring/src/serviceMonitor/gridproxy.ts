import { resolveServiceStatus, sendRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";

export class GridProxyMonitor implements ILivenessChecker {
  private readonly _name = "GridProxy";
  private _url: string;
  constructor(gridProxyUrl?: string) {
    if (gridProxyUrl) this.url = gridProxyUrl;
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
    this._url = param.url;
  }
  async isAlive(): Promise<ServiceStatus> {
    return resolveServiceStatus(sendRequest(this.url, { method: "Get" }));
  }
}
