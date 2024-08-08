import { resolveServiceStatus, sendRequest } from "../helpers/utils";
import { ILivenessChecker, ServiceStatus } from "../types";

export class ActivationMonitor implements ILivenessChecker {
  private readonly _name = "Activation";
  private _url: string;
  constructor(activationServiceUrl?: string) {
    if (activationServiceUrl) this.url = activationServiceUrl;
  }
  public get name() {
    return this._name;
  }
  public get url() {
    return this._url ?? "";
  }
  public set url(url: string) {
    this._url = url;
  }
  async isAlive(url = this.url): Promise<ServiceStatus> {
    if (!url) throw new Error("Can't access before initialization");
    return resolveServiceStatus(sendRequest(url, { method: "Get" }));
  }
}
