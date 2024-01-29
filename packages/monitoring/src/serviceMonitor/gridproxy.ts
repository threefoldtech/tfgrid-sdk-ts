import { resolveServiceStatus, sendGetRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";

export class GridProxyMonitor implements ILivenessChecker {
  private _serviceName = "GridProxy";
  private _serviceURL: string;
  constructor(gridProxyUrl: string) {
    this._serviceURL = gridProxyUrl;
  }
  serviceName() {
    return this._serviceName;
  }
  serviceUrl() {
    return this._serviceURL;
  }
  async isAlive(): Promise<ServiceStatus> {
    return resolveServiceStatus(sendGetRequest(this._serviceURL));
  }
}
