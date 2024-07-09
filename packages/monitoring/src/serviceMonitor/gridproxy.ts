import { resolveServiceStatus, sendGetRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";

export class GridProxyMonitor implements ILivenessChecker {
  private readonly name = "GridProxy";
  private url: string;
  constructor(gridProxyUrl: string) {
    this.url = gridProxyUrl;
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
    return resolveServiceStatus(sendGetRequest(this.url));
  }
}
