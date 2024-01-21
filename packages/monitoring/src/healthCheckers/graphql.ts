import { SendGetRequest } from "../helpers/utils";
import { ILivenessChecker } from "../types/index";

export class GraphQlHealthCheck implements ILivenessChecker {
  public ServiceName = "GraphQl";
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
