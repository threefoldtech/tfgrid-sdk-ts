import { KVStoreSetOptions } from "@threefold/tfchain_client";

import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { KVStoreBatchRemoveModel, KVStoreGetModel, KVStoreRemoveModel, KVStoreSetModel } from "./models";
import { checkBalance } from "./utils";

class KVStore {
  client: TFClient;

  /**
   * Represents a `key-value` store class that interacts with the `TFClient` for performing `CRUD operations`.
   *
   * This class provides methods for `setting`, `getting`, `listing`, `removing`, and `batch removing` `key-value` pairs.
   *
   * It enforces `validation on input` parameters and `checks the balance` before executing certain operations.
   *
   * @class KVStore
   * @param {GridClientConfig} config - The configuration object for initializing the client.
   */
  constructor(public config: GridClientConfig) {
    this.client = config.tfclient;
  }

  /**
   * Asynchronously sets a `key-value` pair using the provided options.
   *
   * This method interacts with the `TFClient` to set a `key-value` pair based on the specified options.
   *
   * @param {KVStoreSetModel} options - The options object containing the key, value, and optional encryption flag.
   * @returns {Promise<void>} A promise that resolves once the `key-value` pair is successfully set.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async set(options: KVStoreSetModel): Promise<KVStoreSetOptions> {
    return (await this.client.kvStore.set(options)).apply();
  }

  /**
   * Asynchronously retrieves a `key-value` pair based on the provided options.
   *
   * This method interacts with the `TFClient` to get a `key-value` pair using the specified options.
   *
   * @param {KVStoreGetModel} options - The options object containing the `key` and an optional `decryption` flag.
   * @returns {Promise<string>} A promise that resolves with the retrieved `value` of the `options.key`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  async get(options: KVStoreGetModel): Promise<string> {
    return await this.client.kvStore.get(options);
  }

  /**
   * Asynchronously retrieves a list of all `keys`.
   *
   * This method interacts with the `TFClient` to retrieve a list of all stored `keys`.
   *
   * @returns {Promise<string[]>} A promise that resolves with the list of all `keys`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters.
   */
  @expose
  @validateInput
  async list(): Promise<string[]> {
    return await this.client.kvStore.list();
  }

  /**
   * Asynchronously removes a `key-value` pair based on the provided options.
   *
   * This method interacts with the `TFClient` to delete a `key-value` pair using the specified options.
   *
   * @param {KVStoreRemoveModel} options - The options object containing the `key` to be removed.
   * @returns {Promise<KVStoreSetOptions>} A promise that resolves once the `key-value` pair is successfully removed.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async remove(options: KVStoreRemoveModel): Promise<KVStoreSetOptions> {
    return (await this.client.kvStore.delete(options)).apply();
  }

  /**
   * Asynchronously removes all `key-value` pairs from the `key-value` store.
   *
   * This method interacts with the TFClient to delete all `key-value` pairs stored in the `key-value` store.
   *
   * @returns {Promise<string[]>} A promise that resolves with a list of keys that were successfully removed.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async removeAll(): Promise<string[]> {
    return this.client.kvStore.deleteAll();
  }

  /**
   * Asynchronously removes a batch of `key-value` pairs based on the provided options.
   *
   * This method interacts with the `TFClient` to delete a batch of `key-value` pairs using the specified options.
   *
   * @param {KVStoreBatchRemoveModel} options - The options object containing an array of keys to be removed.
   * @returns {Promise<string[]>} A promise that resolves with a list of keys that were successfully removed.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async batchRemove(options: KVStoreBatchRemoveModel): Promise<string[]> {
    return await this.client.kvStore.batchRemove(options);
  }
}

export { KVStore as kvstore };
