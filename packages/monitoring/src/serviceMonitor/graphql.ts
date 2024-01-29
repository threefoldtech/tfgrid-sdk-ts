import { resolveServiceStatus, sendGetRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";

export class GraphQlMonitor implements ILivenessChecker {
  private _serviceName = "GraphQl";
  private _serviceURL: string;
  constructor(graphQlUrl: string) {
    this._serviceURL = graphQlUrl;
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
