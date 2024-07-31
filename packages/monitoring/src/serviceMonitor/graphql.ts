import { resolveServiceStatus, sendRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";

export class GraphQLMonitor implements ILivenessChecker {
  private readonly _name = "GraphQl";
  private _url: string;
  constructor(graphQlUrl?: string) {
    if (graphQlUrl) this._url = graphQlUrl;
  }
  public get name() {
    return this._name;
  }
  public get url() {
    return this._url ?? "";
  }
  private set url(url: string) {
    this._url = url;
  }
  public update(param: { url: string }) {
    this._url = param.url;
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
