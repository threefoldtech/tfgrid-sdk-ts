import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { ISubmittableResult } from "@polkadot/types/types";

import { Client } from "./client";

class KVStore {
  constructor(public client: Client) {
    this.client = client;
  }

  async setExtrinsic(key: string, value: string): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    return this.client.checkConnectionAndApply(this.client.api.tx.tfkvStore.set, [key, value]);
  }

  async set(key: string, value: string): Promise<void> {
    const extrinsic = await this.setExtrinsic(key, value);
    return this.client.applyExtrinsic<void>(extrinsic);
  }

  async deleteExtrinsic(key: string): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    return this.client.checkConnectionAndApply(this.client.api.tx.tfkvStore.delete, [key]);
  }

  async delete(key: string): Promise<void> {
    const extrinsic = await this.deleteExtrinsic(key);
    return this.client.applyExtrinsic<void>(extrinsic);
  }

  async get(key: string): Promise<string> {
    const res = await this.client.checkConnectionAndApply(this.client.api.query.tfkvStore.tfkvStore, [
      this.client.address,
      key,
    ]);
    return res.toPrimitive();
  }

  async list(): Promise<string[]> {
    const res = await this.client.checkConnectionAndApply(this.client.api.query.tfkvStore.tfkvStore.entries, [
      this.client.address,
    ]);
    const keys: string[] = [];
    for (const key of res) {
      keys.push(key[0].toHuman()[1]);
    }
    return keys;
  }

  async deleteAll(): Promise<number[]> {
    const keys = await this.list();
    const extrinsics: SubmittableExtrinsic<"promise", ISubmittableResult>[] = [];
    for (const k of keys) {
      extrinsics.push(await this.deleteExtrinsic(k));
    }
    return this.client.applyAllExtrinsics<number[]>(extrinsics);
  }
}

export { KVStore };
