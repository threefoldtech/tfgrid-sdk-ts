import { resolveServiceStatus, sendGetRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";

export class Activation implements ILivenessChecker {
  private readonly name = "Activation";
  private url: string;
  constructor(activationServiceUrl: string) {
    this.url = activationServiceUrl;
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
