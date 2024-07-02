import { Client } from "./client";
import type { ExtrinsicResult } from "./types";
import { checkConnection } from "./utils";

export interface KVStoreSetOptions {
  key: string;
  value: string;
}

export interface KVStoreGetOptions {
  key: string;
}

class KVStore {
  constructor(public client: Client) {
    this.client = client;
  }

  /**
   * Asynchronously sets a `key-value` pair in the `key-value` store.
   *
   * This method first checks the connection status, then creates an extrinsic to set the provided `key-value` pair.
   * It then patches the extrinsic and returns the options that were set.
   *
   * @param options - An object containing the key and value to be set in the `key-value` store.
   * @returns {Promise<ExtrinsicResult<KVStoreSetOptions>>} A promise that resolves to the options that were set in the store.
   */
  @checkConnection
  async set(options: KVStoreSetOptions): Promise<ExtrinsicResult<KVStoreSetOptions>> {
    const extrinsic = await this.client.api.tx.tfkvStore.set(options.key, options.value);
    return this.client.patchExtrinsic<KVStoreSetOptions>(extrinsic);
  }

  /**
   * Asynchronously deletes a `key-value` pair from the `key-value` store.
   *
   * This method first checks the connection status, then creates an extrinsic to delete the provided `key`.
   * It then patches the extrinsic and returns the result of the deletion operation.
   *
   * @param options - An object containing the key to be deleted from the `key-value` store.
   * @returns {Promise<ExtrinsicResult<KVStoreSetOptions>>} A promise that resolves once the key is successfully deleted.
   */
  @checkConnection
  async delete(options: KVStoreGetOptions): Promise<ExtrinsicResult<KVStoreSetOptions>> {
    const extrinsic = await this.client.api.tx.tfkvStore.delete(options.key);
    return this.client.patchExtrinsic<KVStoreSetOptions>(extrinsic);
  }

  /**
   * Asynchronously retrieves the value associated with the provided key from the `key-value` store.
   *
   * This method first checks the connection status, then queries the `key-value` store
   * to fetch the value associated with the client's address and the provided key.
   *
   * @param options - An object containing the key for which the value needs to be retrieved.
   * @returns {Promise<string>} A promise that resolves to the value associated with the provided key.
   */
  @checkConnection
  async get(options: KVStoreGetOptions): Promise<string> {
    const res = await this.client.api.query.tfkvStore.tfkvStore(this.client.address, options.key);
    return res.toPrimitive() as string;
  }

  /**
   * Asynchronously retrieves a list of `keys` stored in the `key-value` store.
   *
   * This method first checks the connection status, then queries the `key-value` store
   * to fetch all entries associated with the client's address. It extracts the `keys`
   * from the response and returns them as an array of strings.
   *
   * @returns A promise that resolves to an array of strings representing the `keys` in the store.
   */
  @checkConnection
  async list(): Promise<string[]> {
    const res = await this.client.api.query.tfkvStore.tfkvStore.entries(this.client.address);
    const keys: string[] = [];
    for (const key of res) {
      const k = key[0].toHuman();
      if (k) keys.push(k[1]);
    }
    return keys;
  }

  /**
   * Asynchronously deletes all `key-value` pairs stored in the `key-value` store associated with the client's address.
   *
   * This method first retrieves a list of keys using the `list` method, then creates extrinsics to delete each `key-value` pair.
   * It applies all the extrinsics using `applyAllExtrinsics` method and returns an array of keys that were deleted.
   *
   * @returns {Promise<string[]>} A promise that resolves to an array of strings representing the keys that were deleted.
   */
  async deleteAll(): Promise<string[]> {
    const keys: string[] = await this.list();
    const extrinsics: ExtrinsicResult<KVStoreGetOptions>[] = [];
    for (const key of keys) {
      extrinsics.push(await this.delete({ key }));
    }
    await this.client.applyAllExtrinsics<KVStoreGetOptions>(extrinsics);
    return keys;
  }
}

export { KVStore };
