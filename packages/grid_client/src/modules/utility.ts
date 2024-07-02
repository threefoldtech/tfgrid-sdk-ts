import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { BatchModel } from "./models";
import { checkBalance } from "./utils";

interface Extrinsic {
  extrinsic: [];
}

class Utility {
  client: TFClient;

  /**
   * Represents a `Utility class` that provides `utility methods` for interacting with the `TFClient`.
   * This class includes methods for `batching operations` and `checking balance` before applying extrinsics.
   *
   * @class Utility
   * @param {GridClientConfig} config - The configuration object for initializing the client.
   */
  constructor(public config: GridClientConfig) {
    this.client = config.tfclient;
  }

  /**
   * Executes a batch operation using the provided options.
   * This method first checks the balance to ensure it is sufficient before applying the extrinsics.
   *
   * @param {BatchModel<T>} options - The options for the batch operation, including the extrinsics to be executed.
   * @returns {Promise<T[]>} A promise that resolves with the result of the batch operation.
   */
  @expose
  @checkBalance
  async batch<T>(options: BatchModel<T>): Promise<T[]> {
    return await this.client.utility.batch(options.extrinsics);
  }

  /**
   * Executes a batch operation for all provided extrinsics.
   * This method first checks the balance to ensure it is sufficient before applying the extrinsics.
   *
   * @param {BatchModel<T>} options - The options for the batch operation, including the extrinsics to be executed.
   * @returns {Promise<T[]>} A promise that resolves with the result of the batch operation.
   */
  @expose
  @checkBalance
  async batchAll<T>(options: BatchModel<T>): Promise<T[]> {
    return await this.client.utility.batchAll(options.extrinsics);
  }
}

export { Utility as utility };
