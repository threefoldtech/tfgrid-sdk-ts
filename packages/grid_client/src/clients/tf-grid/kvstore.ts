import { KVStore, KVStoreGetOptions, KVStoreSetOptions } from "@threefold/tfchain_client";
import Crypto from "crypto-js";
import nacl from "tweetnacl";
import utils from "tweetnacl-util";

import { randomNonce } from "../../helpers/utils";
import { TFClient } from "./client";

export interface KVStoreBatchRemoveOptions {
  keys: string[];
}
class TFKVStore extends KVStore {
  constructor(public client: TFClient) {
    super(client);
  }

  async set(options: KVStoreSetOptions) {
    const encryptedValue = this.encrypt(options.value);
    return super.set({ key: options.key, value: encryptedValue });
  }

  async get(options: KVStoreGetOptions) {
    const encryptedValue = await super.get(options);
    if (encryptedValue) {
      try {
        return this.decrypt(encryptedValue);
      } catch (e) {
        throw Error(`Couldn't decrypt key: ${options.key}`);
      }
    }
    return encryptedValue;
  }

  async batchRemove(options: KVStoreBatchRemoveOptions): Promise<string[]> {
    const extrinsics = [];
    for (const key of options.keys) {
      extrinsics.push(await this.delete({ key }));
    }
    await this.client.applyAllExtrinsics(extrinsics);
    return options.keys;
  }

  getSecretAsBytes(): Uint8Array {
    if (typeof this.client.storeSecret === "string") {
      const hashed = Crypto.SHA256(this.client.storeSecret);
      const asBase64 = Crypto.enc.Base64.stringify(hashed);
      return utils.decodeBase64(asBase64);
    }
    return this.client.storeSecret;
  }

  encrypt(message) {
    const encodedMessage = utils.decodeUTF8(message);
    const nonce = randomNonce();
    const encryptedMessage = nacl.secretbox(encodedMessage, nonce, this.getSecretAsBytes());
    const fullMessage = Uint8Array.from([...encryptedMessage, ...nonce]);
    return utils.encodeBase64(fullMessage);
  }

  decrypt(message: string) {
    const encodedMessage = utils.decodeBase64(message);
    const encryptedMessage = encodedMessage.slice(0, -24);
    const nonce = encodedMessage.slice(-24);
    const decryptedMessage = nacl.secretbox.open(encryptedMessage, nonce, this.getSecretAsBytes());

    return utils.encodeUTF8(decryptedMessage);
  }
}

export { TFKVStore };
