import { RequestError } from "@threefold/types";

import { ILivenessChecker, ServiceStatus } from "../types";

export class RMBMonitor implements ILivenessChecker {
  private _name = "RMB";
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
    if (!this.url) throw new Error("Can't access before initialization");
    const splittedURL = this.url.split("relay");
    const url = splittedURL[1] ? "https://gridproxy" + splittedURL[1] : this.url;
    try {
      const res = await fetch(url + "/health");
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
