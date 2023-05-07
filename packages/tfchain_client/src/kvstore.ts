import { Client } from "./client";
import type { Extrinsic } from "./types";

class KVStore {
  constructor(public client: Client) {
    this.client = client;
  }

  async set(key: string, value: string) {
    const extrinsic = await this.client.checkConnectionAndApply(this.client.api.tx.tfkvStore.set, [key, value]);
    return this.client.patchExtrinsic<void>(extrinsic);
  }

  async delete(key: string) {
    const extrinsic = await this.client.checkConnectionAndApply(this.client.api.tx.tfkvStore.delete, [key]);
    return this.client.patchExtrinsic<void>(extrinsic);
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
    const extrinsics: Extrinsic[] = [];
    for (const k of keys) {
      extrinsics.push(await this.delete(k));
    }
    return this.client.applyAllExtrinsics<number[]>(extrinsics);
  }
}

export { KVStore };
