import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { AddFarmIPModel, AddStellarModel, CreateFarmModel, FarmIdModel, RemoveFarmIPModel } from "./models";

class Farms {
  client: TFClient;

  constructor(public config: GridClientConfig) {
    this.client = new TFClient(config.substrateURL, config.mnemonic, config.storeSecret, config.keypairType);
  }

  @expose
  @validateInput
  async create(options: CreateFarmModel) {
    return (await this.client.farms.create(options)).apply();
  }

  @expose
  @validateInput
  async addFarmIp(options: AddFarmIPModel) {
    return (await this.client.farms.addFarmIp(options)).apply();
  }

  @expose
  @validateInput
  async removeFarmIp(options: RemoveFarmIPModel) {
    return (await this.client.farms.removeFarmIp(options)).apply();
  }

  @expose
  @validateInput
  async addStellarAddress(options: AddStellarModel) {
    return (await this.client.farms.addStellarAddress(options)).apply();
  }

  @expose
  @validateInput
  async getFarmByID(options: FarmIdModel) {
    return this.client.farms.get(options);
  }
}

export { Farms as farms };
