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
  private set url(url: string) {
    this._url = url;
  }
  public update(param: { url: string }): void {
    this.url = param.url;
  }
  async isAlive(): Promise<ServiceStatus> {
    return resolveServiceStatus(sendRequest(this.url, { method: "Get" }));
  }
}
