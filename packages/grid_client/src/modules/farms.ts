import { Farm } from "@threefold/tfchain_client";

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

  /**
   * Represents a class that handles operations related to farms.
   * This class provides methods to create farms, add/remove farm IPs, add Stellar addresses to farms,
   * get farms by ID, and perform balance checks before executing operations.
   *
   * @param {GridClientConfig} config - The configuration object for initializing the client.
   */
  constructor(public config: GridClientConfig) {
    this.client = config.tfclient;
  }

  /**
   * Creates a new farm using the provided options.
   *
   * This method first checks the balance to ensure there are enough funds available.
   *
   * @param {CreateFarmModel} options - The options for creating the farm, including the name and public IPs.
   * @returns {Promise<Farm>} A promise that resolves when the farm creation is successful.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async create(options: CreateFarmModel): Promise<Farm> {
    return (await this.client.farms.create(options)).apply();
  }

  /**
   * Adds a new IP address to an existing farm.
   *
   * This method first validates the input, checks the balance to ensure there are enough funds available,
   * and then adds the IP address to the specified farm.
   *
   * @param {AddFarmIPModel} options - The options for adding the IP address to the farm, including the farm ID, IP, and gateway.
   * @returns {Promise<Farm>} A promise that resolves when the IP address is successfully added to the farm.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async addFarmIp(options: AddFarmIPModel): Promise<Farm> {
    return (await this.client.farms.addFarmIp(options)).apply();
  }

  /**
   * Removes a specific IP address from an existing farm.
   *
   * This method first validates the input, checks the balance to ensure there are enough funds available,
   * and then removes the specified IP address from the farm.
   *
   * @param {RemoveFarmIPModel} options - The options for removing the IP address from the farm, including the farm ID and IP.
   * @returns {Promise<unknown>} A promise that resolves when the IP address is successfully removed from the farm.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async removeFarmIp(options: RemoveFarmIPModel): Promise<Farm> {
    return (await this.client.farms.removeFarmIp(options)).apply();
  }

  /**
   * Removes farm IPs
   *
   * @param {RemoveFarmIPModel[]} options - An array of options used to remove farm IPs
   * @returns {Promise<void>} A promise that resolves when all farm IPs have been removed
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async removeFarmIps(options: RemoveFarmIPModel[]): Promise<void> {
    return await this.client.farms.removeFarmIps(options);
  }

  /**
   * Adds a `Stellar` address to a farm.
   *
   * This method first validates the input and checks the balance to ensure there are enough funds available.
   * It then adds the `Stellar` address to the specified farm.
   *
   * @param {AddStellarAddressToFarmModel} options - The options for adding the `Stellar` address to the farm, including the `farm ID` and `Stellar address`.
   * @returns {Promise<number>} A promise that resolves number as the `Farm ID` after the `Stellar` address is successfully added to the farm.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async addStellarAddress(options: AddStellarAddressToFarmModel): Promise<number> {
    return (await this.client.farms.addStellarAddress(options)).apply();
  }

  /**
   * Retrieves a farm by its ID.
   *
   * This method fetches the farm details based on the provided farm ID.
   *
   * @param {FarmIdModel} options - The options containing the ID of the farm to retrieve.
   * @returns {Promise<Farm>} A promise that resolves with the farm details.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getFarmByID(options: FarmIdModel): Promise<Farm> {
    return this.client.farms.get(options);
  }
}

export { Farms as farms };
