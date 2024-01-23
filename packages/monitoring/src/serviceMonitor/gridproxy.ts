import { resolveServiceStatus, sendGetRequest } from "../helpers/utils";
import { IServiceAliveness, ServiceStatus } from "../types";

export class GridProxyMonitor implements IServiceAliveness {
  public readonly ServiceName = "GridProxy";
  public ServiceURL: string;
  constructor(gridProxyUrl: string) {
    this.ServiceURL = gridProxyUrl;
  }
  async isAlive(): Promise<ServiceStatus> {
    return resolveServiceStatus(sendGetRequest(this.ServiceURL));
  }
}
