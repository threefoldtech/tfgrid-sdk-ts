import Crypto from "crypto-js";
import nacl from "tweetnacl";
import utils from "tweetnacl-util";

import { randomNonce } from "../../helpers/utils";
import { TFClient } from "./client";

class KVStore {
    tfclient: TFClient;

    constructor(client: TFClient) {
        this.tfclient = client;
    }

    async set(key: string, value: string) {
        const encryptedValue = this.encrypt(value);
        return await this.tfclient.applyExtrinsic(this.tfclient.client.tfStoreSet, [key, encryptedValue], "tfkvStore", [
            "EntrySet",
        ]);
    }

    async get(key: string) {
        const encryptedValue = await this.tfclient.queryChain(this.tfclient.client.tfStoreGet, [key]);
        if (encryptedValue) {
            try {
                return this.decrypt(encryptedValue);
            } catch (e) {
                throw Error(`Couldn't decrypt key: ${key}`);
            }
        }
        return encryptedValue;
    }

    async list() {
        return await this.tfclient.queryChain(this.tfclient.client.tfStoreList, []);
    }

    async remove(key: string) {
        return this.tfclient.applyExtrinsic(this.tfclient.client.tfStoreRemove, [key], "tfkvStore", ["EntryTaken"]);
    }

    async removeAll(): Promise<string[]> {
        const keys = await this.list();
        await this.batchRemove(keys);
        return keys;
    }

    async batchRemove(keys: string[]): Promise<string[]> {
        const extrinsics = [];
        for (const k of keys) {
            extrinsics.push(this.tfclient.client.api.tx.tfkvStore.delete(k));
        }
        await this.tfclient.utility.batchAll(extrinsics);
        return keys;
    }

    getSecretAsBytes(): Uint8Array {
        if (typeof this.tfclient.storeSecret === "string") {
            const hashed = Crypto.SHA256(this.tfclient.storeSecret);
            const asBase64 = Crypto.enc.Base64.stringify(hashed);
            return utils.decodeBase64(asBase64);
        }
        return this.tfclient.storeSecret;
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

export { KVStore };
