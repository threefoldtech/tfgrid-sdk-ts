import { resolveServiceStatus, sendRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";
import { ServiceBase } from "./serviceBase";

export class GraphQLMonitor extends ServiceBase implements ILivenessChecker {
  constructor(ServiceUrl?: string) {
    super("GraphQl");
    if (ServiceUrl) this.url = ServiceUrl;
  }
  async isAlive(url = this.url): Promise<ServiceStatus> {
    if (!url) throw new Error("Can't access before initialization");
    return resolveServiceStatus(
      sendRequest(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: "query monitoring{__typename}",
        }),
      }),
    );
  }
}
