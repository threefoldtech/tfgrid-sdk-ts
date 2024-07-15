import { resolveServiceStatus, sendRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";

export class GraphQLMonitor implements ILivenessChecker {
  private readonly name = "GraphQl";
  private url: string;
  constructor(graphQlUrl: string) {
    this.url = graphQlUrl;
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
    return resolveServiceStatus(
      sendRequest(this.url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: "query monitoring{__typename}",
        }),
      }),
    );
  }
}
