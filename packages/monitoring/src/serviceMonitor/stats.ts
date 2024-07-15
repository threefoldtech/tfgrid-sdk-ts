import { resolveServiceStatus, sendRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";

export class Stats implements ILivenessChecker {
  private readonly name = "Stats";
  private url: string;
  constructor(statusUrl: string) {
    this.url = statusUrl;
  }
  serviceName() {
    return this.name;
  }
  serviceUrl() {
    return this.url;
  }
  updateUrl(url: string) {
    this.url = url;
  }
  async isAlive(): Promise<ServiceStatus> {
    return resolveServiceStatus(sendRequest(this.url, { method: "Get" }));
  }
}
