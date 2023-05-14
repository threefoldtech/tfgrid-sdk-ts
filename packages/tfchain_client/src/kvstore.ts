import { Client } from "./client";
import type { Extrinsic } from "./types";

interface KVStoreSetOptions {
  key: string;
  value: string;
}

interface KVStoreGetOptions {
  key: string;
}

class KVStore {
  constructor(public client: Client) {
    this.client = client;
  }

  async set(options: KVStoreSetOptions) {
    const extrinsic = await this.client.checkConnectionAndApply(this.client.api.tx.tfkvStore.set, [
      options.key,
      options.value,
    ]);
    return this.client.patchExtrinsic<void>(extrinsic);
  }

  async delete(options: KVStoreGetOptions) {
    const extrinsic = await this.client.checkConnectionAndApply(this.client.api.tx.tfkvStore.delete, [options.key]);
    return this.client.patchExtrinsic<void>(extrinsic);
  }

  async get(options: KVStoreGetOptions): Promise<string> {
    const res = await this.client.checkConnectionAndApply(this.client.api.query.tfkvStore.tfkvStore, [
      this.client.address,
      options.key,
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

  async deleteAll() {
    const keys = await this.list();
    const extrinsics: Extrinsic[] = [];
    for (const key of keys) {
      extrinsics.push(await this.delete({ key }));
    }
    return this.client.applyAllExtrinsics<number[]>(extrinsics);
  }
}

export { KVStore };
