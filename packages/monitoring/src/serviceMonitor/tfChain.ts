import { resolveServiceStatus, sendRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";

export class TFChainMonitor implements ILivenessChecker {
  private _name = "TFChain";
  private _url: string;
  constructor(tfchainUrl?: string) {
    if (tfchainUrl) this.url = tfchainUrl;
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
  async isAlive(url = this.url): Promise<ServiceStatus> {
    if (!url) throw new Error("Can't access before initialization");
    let _url = url.replace("wss", "https");
    _url = _url.replace("/ws", "/health");
    return resolveServiceStatus(sendRequest(_url, { method: "Get" }));
  }
}
