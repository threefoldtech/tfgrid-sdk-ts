import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import {
  AddFarmIPModel,
  AddStellarAddressToFarmModel,
  CreateFarmModel,
  FarmIdModel,
  RemoveFarmIPModel,
} from "./models";
import { checkBalance } from "./utils";

class Farms {
  client: TFClient;

  constructor(public config: GridClientConfig) {
    this.client = config.tfclient;
  }

  @expose
  @validateInput
  @checkBalance
  async create(options: CreateFarmModel) {
    return (await this.client.farms.create(options)).apply();
  }

  @expose
  @validateInput
  @checkBalance
  async addFarmIp(options: AddFarmIPModel) {
    return (await this.client.farms.addFarmIp(options)).apply();
  }

  @expose
  @validateInput
  @checkBalance
  async removeFarmIp(options: RemoveFarmIPModel) {
    return (await this.client.farms.removeFarmIp(options)).apply();
  }

  @expose
  @validateInput
  @checkBalance
  async addStellarAddress(options: AddStellarAddressToFarmModel) {
    return (await this.client.farms.addStellarAddress(options)).apply();
  }

  @expose
  @validateInput
  async getFarmByID(options: FarmIdModel) {
    return this.client.farms.get(options);
  }
}

export { Farms as farms };
