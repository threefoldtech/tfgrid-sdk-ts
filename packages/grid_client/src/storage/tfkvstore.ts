import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { ISubmittableResult } from "@polkadot/types/types";
import { ExtrinsicResult, KVStoreSetOptions } from "@threefold/tfchain_client";

import { TFClient } from "../clients/tf-grid/client";
import { KeypairType } from "../zos/deployment";
import BackendStorageInterface from "./BackendStorageInterface";
import { crop, cropKey } from "./utils";

const SPLIT_SIZE = 1490;

class TFKVStoreBackend implements BackendStorageInterface {
  client: TFClient;
  constructor(url: string, mnemonic: string, storeSecret: string | Uint8Array, keypairType: KeypairType) {
    this.client = new TFClient(url, mnemonic, storeSecret, keypairType);
  }

  private async cleanFragments(key: string, start: number) {
    let k = `${key}.${start}`;
    let value = await this.client.kvStore.get({ key: k });
    if (!value) {
      return [];
    }
    const extrinsics: SubmittableExtrinsic<"promise", ISubmittableResult>[] = [];
    while (value) {
      extrinsics.push(await this.client.kvStore.delete({ key: k }));
      start++;
      k = `${key}.${start}`;
      value = await this.client.kvStore.get({ key: k });
    }
    return extrinsics;
  }

  @crop
  async set(key: string, value: string) {
    if (!value || value === '""') {
      return await this.remove(key);
    }
    let extrinsics: SubmittableExtrinsic<"promise", ISubmittableResult>[] = [];
    const splits = this.split(key, value);
    for (const k of Object.keys(splits)) {
      extrinsics.push(await this.client.kvStore.set({ key: k, value: splits[k] }));
    }
    extrinsics = extrinsics.concat(await this.cleanFragments(key, Object.keys(splits).length));
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
    let k = key;
    while (val) {
      i++;
      k = `${key}.${i}`;
      val = await this.client.kvStore.get({ key: k });
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

    const extrinsics: SubmittableExtrinsic<"promise", ISubmittableResult>[] = await this.cleanFragments(key, 1);
    extrinsics.push(await this.client.kvStore.delete({ key }));
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

  public async moveValue(fromKey: string, toKey: string): Promise<ExtrinsicResult<string>[]> {
    fromKey = cropKey(fromKey);
    toKey = cropKey(toKey);

    const exts: ExtrinsicResult<string>[] = [];

    for (let i = 0; ; i++) {
      const key = i === 0 ? fromKey : fromKey + "." + i;
      const value = await this.client.kvStore.get({ key, decrypt: false });
      if (value) {
        const promises = [this.client.kvStore.set({ key: toKey, value, encrypt: false })];
        if (fromKey !== toKey) {
          promises.push(this.client.kvStore.delete({ key }));
        }
        const e = await Promise.all(promises);
        exts.push(...e.flat(1));
      } else {
        break;
      }
    }

    return exts;
  }
}

export { TFKVStoreBackend };
