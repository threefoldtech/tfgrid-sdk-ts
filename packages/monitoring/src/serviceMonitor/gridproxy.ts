import { sendGetRequest } from "../helpers/utils";
import { IServiceAliveness, ServiceStatus } from "../types";

export class GridProxyMonitor implements IServiceAliveness {
  public readonly ServiceName = "GridProxy";
  public ServiceURL: string;
  constructor(gridProxyUrl: string) {
    this.ServiceURL = gridProxyUrl;
  }
  async isAlive(): Promise<ServiceStatus> {
    try {
      await sendGetRequest(this.ServiceURL);
      return {
        alive: true,
      };
    } catch (error) {
      return {
        alive: false,
        error,
      };
    }
  }
}
