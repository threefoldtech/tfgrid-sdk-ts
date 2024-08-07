import { Twin } from "@threefold/tfchain_client";

import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { TwinCreateModel, TwinGetByAccountIdModel, TwinGetModel } from "./models";
import { checkBalance } from "./utils";

class Twins {
  client: TFClient;

  /**
   * Represents a class for managing Twin operations using a TFClient instance.
   * This class provides methods for creating, updating, and retrieving Twin information.
   * It also includes functionality to get the current user's Twin ID and retrieve Twin ID by account ID.
   *
   * @class Twins
   * @param {GridClientConfig} config - The configuration object for initializing the client.
   */
  constructor(public config: GridClientConfig) {
    this.client = config.tfclient;
  }

  /**
   * Creates a new Twin using the provided options.
   *
   * This method first creates a Twin using the `TFClient` instance associated with the Twins class.
   * It then applies the created Twin.
   *
   * @param {TwinCreateModel} options - The options for creating the Twin.
   * @returns {Promise<Twin>} A promise that resolves with the result of applying the created Twin.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async create(options: TwinCreateModel): Promise<Twin> {
    return (await this.client.twins.create(options)).apply();
  }

  /**
   * Updates an existing Twin using the provided options.
   *
   * This method first updates a Twin using the `TFClient` instance associated with the Twins class.
   * It then applies the updated Twin.
   *
   * @param {TwinCreateModel} options - The options for updating the Twin.
   * @returns {Promise<Twin>} A promise that resolves with the result of applying the updated Twin.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async update(options: TwinCreateModel): Promise<Twin> {
    return (await this.client.twins.update(options)).apply();
  }

  /**
   * Retrieves Twin information based on the provided options.
   *
   * This method retrieves Twin information using the `TFClient` instance associated with the `Twins` class.
   *
   * @param {TwinGetModel} options - The options for retrieving Twin information.
   * @returns {Promise<Twin>} A promise that resolves with the retrieved Twin information.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async get(options: TwinGetModel): Promise<Twin> {
    return await this.client.twins.get(options);
  }

  /**
   * Retrieves the Twin ID of the current user.
   *
   * This method calls the `getMyTwinId` function from the `TFClient` instance associated with the `Twins` class to retrieve the Twin ID of the current user.
   *
   * @returns {Promise<number>} A promise that resolves with the Twin ID of the current user.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async get_my_twin_id(): Promise<number> {
    return await this.client.twins.getMyTwinId();
  }

  /**
   * Retrieves the `Twin ID` associated with the provided `account ID`.
   *
   * This method calls the `getTwinIdByAccountId` function from the `TFClient` instance associated with the `Twins` class to retrieve the `Twin ID` based on the provided `account ID`.
   *
   * @param {TwinGetByAccountIdModel} options - The options containing the `account ID` for which to retrieve the `Twin ID`.
   * @returns {Promise<number>} A promise that resolves with the `Twin ID` associated with the provided `account ID`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async get_twin_id_by_account_id(options: TwinGetByAccountIdModel): Promise<number> {
    return await this.client.twins.getTwinIdByAccountId({ accountId: options.public_key });
  }
}

export { Twins as twins };
