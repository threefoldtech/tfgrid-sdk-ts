import { resolveServiceStatus, sendRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";
import { ServiceBase } from "./serviceBase";
export class TFChainMonitor extends ServiceBase implements ILivenessChecker {
  constructor(ServiceUrl?: string) {
    super("TFChain");
    if (ServiceUrl) this.url = ServiceUrl;
  }
  async isAlive(url = this.url): Promise<ServiceStatus> {
    if (!url) throw new Error("Can't access before initialization");
    let _url = url.replace("wss", "https");
    _url = _url.replace("/ws", "/health");
    return resolveServiceStatus(sendRequest(_url, { method: "Get" }));
  }
}
