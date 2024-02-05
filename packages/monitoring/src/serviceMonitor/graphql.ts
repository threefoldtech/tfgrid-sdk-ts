import { resolveServiceStatus, sendGetRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";

export class GraphQLMonitor implements ILivenessChecker {
  private readonly name = "GraphQl";
  private readonly url: string;
  constructor(graphQlUrl: string) {
    this.url = graphQlUrl;
  }
  serviceName() {
    return this.name;
  }
  serviceUrl() {
    return this.url;
  }

  async isAlive(): Promise<ServiceStatus> {
    return resolveServiceStatus(sendGetRequest(this.url));
  }
}
