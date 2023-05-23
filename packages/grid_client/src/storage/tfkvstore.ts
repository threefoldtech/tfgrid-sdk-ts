import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { ISubmittableResult } from "@polkadot/types/types";

import { TFClient } from "../clients/tf-grid/client";
import { KeypairType } from "../zos/deployment";
import BackendStorageInterface from "./BackendStorageInterface";
import { crop } from "./utils";

const SPLIT_SIZE = 1490;

class TFKVStoreBackend implements BackendStorageInterface {
  client: TFClient;
  constructor(url: string, mnemonic: string, storeSecret: string | Uint8Array, keypairType: KeypairType) {
    this.client = new TFClient(url, mnemonic, storeSecret, keypairType);
  }

  @crop
  async set(key: string, value: string) {
    if (!value || value === '""') {
      return await this.remove(key);
    }
    const extrinsics: SubmittableExtrinsic<"promise", ISubmittableResult>[] = [];
    const splits = this.split(key, value);
    for (const k of Object.keys(splits)) {
      extrinsics.push(await this.client.kvStore.set({ key: k, value: splits[k] }));
    }
    return extrinsics;
  }

  @crop
  async get(key: string) {
    let value = await this.client.kvStore.get({ key });
    if (!value) {
      return '""';
    }
    let i = 0;
    let val = value;
    while (val) {
      i++;
      key = `${key}.${i}`;
      val = await this.client.kvStore.get({ key });
      value = `${value}${val}`;
    }
    return value;
  }

  @crop
  async remove(key: string) {
    const value = await this.client.kvStore.get({ key });
    if (!value) {
      return;
    }
    let i = 0;
    let val = value;
    const extrinsics: SubmittableExtrinsic<"promise", ISubmittableResult>[] = [];
    while (val) {
      extrinsics.push(await this.client.kvStore.delete({ key }));
      i++;
      key = `${key}.${i}`;
      val = await this.client.kvStore.get({ key });
    }
    return extrinsics;
  }

  @crop
  async list(key: string) {
    const keys = await this.client.kvStore.list();
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

  split(key: string, value: string) {
    const splits = {};
    let i = 0;
    let k = key;

    while (value.length > SPLIT_SIZE) {
      const val = value.slice(0, SPLIT_SIZE);
      splits[k] = val;
      i++;
      k = `${key}.${i}`;
      value = value.slice(SPLIT_SIZE);
    }
    splits[k] = value;
    return splits;
  }
}

export { TFKVStoreBackend };
