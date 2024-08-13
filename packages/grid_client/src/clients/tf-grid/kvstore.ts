import { ExtrinsicResult, KVStore, KVStoreGetOptions, KVStoreSetOptions } from "@threefold/tfchain_client";
import { GridClientError } from "@threefold/types";
import Crypto from "crypto-js";
import nacl from "tweetnacl";
import utils from "tweetnacl-util";

import { randomNonce } from "../../helpers/utils";
import { TFClient } from "./client";

export interface KVStoreBatchRemoveOptions {
  keys: string[];
}
class TFKVStore extends KVStore {
  /**
   * Represents a `key-value` store specific to the TFChain client.
   * Extends the base KVStore class and adds encryption and decryption functionalities.
   *
   * @param {TFClient} client - The TFClient instance associated with the `key-value` store.
   */
  constructor(public client: TFClient) {
    super(client);
  }

  /**
   * Prepares a set extrinsic for a `key-value` pair in the `key-value` store.
   * If encryption is enabled, the value will be encrypted before storing.
   *
   * @param {KVStoreSetOptions & { encrypt?: boolean }} options - The options for setting the `key-value` pair.
   * @returns {Promise<ExtrinsicResult<string>>} - A promise that resolves to the address of the connected account.
   */
  async set(options: KVStoreSetOptions & { encrypt?: boolean }): Promise<ExtrinsicResult<string>> {
    if (options.encrypt === false) {
      return super.set({ key: options.key, value: options.value });
    }

    const encryptedValue = this.encrypt(options.value);
    return super.set({ key: options.key, value: encryptedValue });
  }

  /**
   * Retrieves the value associated with the specified key from the `key-value` store.
   * If decryption is enabled, the retrieved value will be decrypted before returning.
   *
   * @param {KVStoreGetOptions & { decrypt?: boolean }} options - The options for getting the `key-value` pair.
   * @returns {Promise<string>} - A promise that resolves with the `decrypted value` if decryption is enabled else will return the `encrypted value`.
   * @throws {`GridClientError`} - If decryption fails, an error is thrown with a message indicating the failure.
   */
  async get(options: KVStoreGetOptions & { decrypt?: boolean }): Promise<string> {
    const encryptedValue = await super.get(options);
    if (options.decrypt === false) {
      return encryptedValue;
    }

    if (encryptedValue) {
      try {
        return this.decrypt(encryptedValue);
      } catch (e) {
        throw new GridClientError(`Couldn't decrypt key: ${options.key}.`);
      }
    }

    return encryptedValue;
  }

  /**
   * Removes multiple `key-value` pairs from the `key-value` store in a batch operation.
   *
   * @param {KVStoreBatchRemoveOptions} options - The options for removing multiple `key-value` pairs.
   * @returns {Promise<string[]>} - A promise that resolves with an array of keys that were removed.
   */
  async batchRemove(options: KVStoreBatchRemoveOptions): Promise<string[]> {
    const extrinsics: ExtrinsicResult<string>[] = [];
    for (const key of options.keys) {
      extrinsics.push(await this.delete({ key }));
    }
    await this.client.applyAllExtrinsics<string>(extrinsics);
    return options.keys;
  }

  /**
   * Retrieves the secret as bytes for encryption.
   * If the secret is a string, it will be hashed using `SHA256`, then encoded as `Base64` and returned as `Uint8Array`.
   * If the secret is already in `bytes` format, it will be returned directly.
   *
   * @returns {Uint8Array} - The secret as bytes for encryption.
   */
  getSecretAsBytes(): Uint8Array {
    if (typeof this.client.storeSecret === "string") {
      const hashed = Crypto.SHA256(this.client.storeSecret);
      const asBase64 = Crypto.enc.Base64.stringify(hashed);
      return utils.decodeBase64(asBase64);
    }
    return this.client.storeSecret;
  }

  /**
   * Encrypts a message using `secret key` and `nonce`.
   *
   * @param {string} message - The message to be encrypted.
   * @returns {string} - The encrypted message in Base64 format.
   */
  encrypt(message: string): string {
    const encodedMessage = utils.decodeUTF8(message);
    const nonce = randomNonce();
    const encryptedMessage = nacl.secretbox(encodedMessage, nonce, this.getSecretAsBytes());
    const fullMessage = Uint8Array.from([...encryptedMessage, ...nonce]);
    return utils.encodeBase64(fullMessage);
  }

  /**
   * Decrypts a message using the `secret key` and `nonce`.
   *
   * @param {string} message - The message to be decrypted in Base64 format.
   * @returns {string} - The decrypted message.
   */
  decrypt(message: string): string {
    const encodedMessage = utils.decodeBase64(message);
    const encryptedMessage = encodedMessage.slice(0, -24);
    const nonce = encodedMessage.slice(-24);
    const decryptedMessage = nacl.secretbox.open(encryptedMessage, nonce, this.getSecretAsBytes());

    return utils.encodeUTF8(decryptedMessage!);
  }
}

export { TFKVStore };
