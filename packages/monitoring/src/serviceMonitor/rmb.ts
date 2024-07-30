import { RequestError } from "@threefold/types";

import { ILivenessChecker, ServiceStatus } from "../types";

export class RMBMonitor implements ILivenessChecker {
  private _name = "RMB";
  private _url: string;
  constructor(RMBUrl?: string) {
    if (RMBUrl) this.url = RMBUrl;
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
    const proxyUrl = url.replace("wss://relay", "https://gridproxy");
    try {
      const res = await fetch(proxyUrl + "/health");
      if (!res?.ok) throw Error(`HTTP Response Code: ${res?.status}`);
      const rmb_conn = (await res.json())?.rmb_conn;
      if (rmb_conn === "ok") {
        return {
          alive: true,
        };
      } else {
        return {
          alive: false,
          error: new Error(`rmb_conn is ${rmb_conn}`),
        };
      }
    } catch (e) {
      throw new RequestError(`HTTP request failed due to  ${e}.`);
    }
  }
}
