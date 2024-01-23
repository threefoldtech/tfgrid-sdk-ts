import { resolveServiceStatus, sendGetRequest } from "../helpers/utils";
import { IServiceAliveness, ServiceStatus } from "../types";

export class GraphQlMonitor implements IServiceAliveness {
  public readonly ServiceName = "GraphQl";
  public ServiceURL: string;
  constructor(graphQlUrl: string) {
    this.ServiceURL = graphQlUrl;
  }
  async isAlive(): Promise<ServiceStatus> {
    return resolveServiceStatus(sendGetRequest(this.ServiceURL));
  }
}
