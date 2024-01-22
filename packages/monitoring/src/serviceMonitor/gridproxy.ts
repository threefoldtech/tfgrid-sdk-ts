import { sendGetRequest } from "../helpers/utils";
import { IServiceAliveness } from "../types/index";

export class GridProxyMonitor implements IServiceAliveness {
  public readonly ServiceName = "GridProxy";
  public ServiceURL: string;
  constructor(gridProxyUrl: string) {
    this.ServiceURL = gridProxyUrl;
  }
  async isAlive(): Promise<boolean> {
    try {
      await sendGetRequest(this.ServiceURL, "", {});
      return true;
    } catch {
      //stream error
      return false;
    }
  }
}
