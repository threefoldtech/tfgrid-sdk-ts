import { sendGetRequest } from "../helpers/utils";
import { IServiceAliveness } from "../types/index";

export class GraphQlMonitor implements IServiceAliveness {
  public readonly ServiceName = "GraphQl";
  public ServiceURL: string;
  constructor(graphQlUrl: string) {
    this.ServiceURL = graphQlUrl;
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
