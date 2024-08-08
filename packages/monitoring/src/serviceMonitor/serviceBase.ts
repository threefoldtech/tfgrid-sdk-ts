import { IServiceBase } from "../types";

export class ServiceBase implements IServiceBase {
  private _url?: string;
  constructor(private readonly _name: string) {}
  public get name() {
    return this._name;
  }
  public get url() {
    return this._url ?? "";
  }
  public set url(url: string) {
    this._url = url;
  }
}
