import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { FarmIdModel } from "./models";

class Farms {
  client: TFClient;

  constructor(public config: GridClientConfig) {
    this.client = config.tfclient;
  }

  @expose
  @validateInput
  async getFarmByID(options: FarmIdModel) {
    return this.client.farms.get(options);
  }
}

export { Farms as farms };
