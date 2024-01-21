import { SendGetRequest } from "../helpers/utils";
import { IServiceMonitor } from "../types/index";

export class GraphQlMonitor implements IServiceMonitor {
  public readonly ServiceName = "GraphQl";
  public ServiceURL: string;
  constructor(graphQlUrl: string) {
    this.ServiceURL = graphQlUrl;
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
