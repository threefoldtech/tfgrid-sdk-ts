import { resolveServiceStatus, sendRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";

export class GraphQLMonitor implements ILivenessChecker {
  private readonly name = "GraphQl";
  private url: string;
  constructor(graphQlUrl?: string) {
    if (graphQlUrl) this.url = graphQlUrl;
  }
  public get Name() {
    return this.name;
  }
  public get URL() {
    if (!this.url) throw new Error("Can't access before initialization");
    return this.url;
  }
  private set URL(url: string) {
    this.url = url;
  }
  public update(param: { url: string }) {
    this.URL = param.url;
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
