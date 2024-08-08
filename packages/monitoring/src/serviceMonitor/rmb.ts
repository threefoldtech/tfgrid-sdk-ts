import { RequestError } from "@threefold/types";

import { ILivenessChecker, ServiceStatus } from "../types";
import { ServiceBase } from "./serviceBase";
export class RMBMonitor extends ServiceBase implements ILivenessChecker {
  constructor(ServiceUrl?: string) {
    super("RMB");
    if (ServiceUrl) this.url = ServiceUrl;
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
