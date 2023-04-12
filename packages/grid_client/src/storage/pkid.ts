import pkid from "@jimber/pkid";
import sodium from "libsodium-wrappers";

import BackendStorageInterface from "./BackendStorageInterface";
import { crop } from "./utils";

class PKID implements BackendStorageInterface {
    pkid: pkid;
    keypair: sodium.keypair;
    allKey = "All";
    url = "https://pkid.jimber.org";

    constructor(seed: string) {
        const decodeBase64 = encoded => {
            return new Uint8Array(
                atob(encoded.replace(/-/g, "+").replace(/_/g, "/"))
                    .split("")
                    .map(c => c.charCodeAt(0)),
            );
        };

        this.keypair = sodium.crypto_sign_seed_keypair(decodeBase64(seed));
        this.pkid = new pkid(this.url, this.keypair);
    }

    @crop
    async set(key: string, value: any) {
        if (value === null || value === undefined || value === "") {
            return await this.remove(key);
        }
        const allKeys = await this.listAll().then(keys => {
            keys.includes(key) ? {} : keys.push(key);
            return keys;
        });
        await this.pkid.setDoc(this.allKey, allKeys);

        key = key.replace(/\//g, "");
        return await this.pkid.setDoc(key, value);
    }

    @crop
    async get(key: string) {
        key = key.replace(/\//g, "");
        const value = await this.pkid.getDoc(this.pkid.keyPair.publicKey, key);

        if (value.data) {
            return value.data;
        }
        return '""';
    }

    @crop
    async remove(key: string) {
        const value = await this.get(key);
        if (!value) {
            return;
        }
        const allKeys = await this.listAll().then((keys: Array<any>) => {
            const index = keys.indexOf(key);
            if (index > -1) {
                keys.splice(index, 1);
            }
            return keys;
        });
        await this.pkid.setDoc(this.allKey, allKeys);
        key = key.replace(/\//g, "");
        return await this.pkid.setDoc(key, "");
    }

    @crop
    async list(key: string) {
        const keys = await this.listAll();
        const filteredKeys = new Set();
        for (const k of keys) {
            if (!k.startsWith(key)) {
                continue;
            }
            const splits = k.split(key)[1].split("/");
            const split = splits[0] === "" ? splits[1] : splits[0];
            filteredKeys.add(split);
        }
        return [...filteredKeys];
    }

    async listAll() {
        let keys = await this.get(this.allKey);
        if (keys == '""') keys = [];
        return keys;
    }
}

export { PKID };
