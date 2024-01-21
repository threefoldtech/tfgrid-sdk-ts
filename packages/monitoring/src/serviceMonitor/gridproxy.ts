import { SendGetRequest } from "../helpers/utils";
import { IServiceMonitor } from "../types/index";

export class GridProxyMonitor implements IServiceMonitor {
  public readonly ServiceName = "GridProxy";
  public ServiceURL: string;
  constructor(gridProxyUrl: string) {
    this.ServiceURL = gridProxyUrl;
  }
  async LiveChecker(): Promise<boolean> {
    try {
      await SendGetRequest(this.ServiceURL, "", {});
      return true;
    } catch {
      //stream error
      return false;
    }
  }
}
