import { Client } from "./client";
import type { Extrinsic, ExtrinsicResult } from "./types";
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

  @checkConnection
  async set(options: KVStoreSetOptions) {
    const extrinsic = await this.client.api.tx.tfkvStore.set(options.key, options.value);
    return this.client.patchExtrinsic<void>(extrinsic);
  }

  @checkConnection
  async delete(options: KVStoreGetOptions) {
    const extrinsic = await this.client.api.tx.tfkvStore.delete(options.key);
    return this.client.patchExtrinsic<void>(extrinsic);
  }

  @checkConnection
  async get(options: KVStoreGetOptions): Promise<string> {
    const res = await this.client.api.query.tfkvStore.tfkvStore(this.client.address, options.key);
    return res.toPrimitive() as string;
  }

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

  async deleteAll(): Promise<string[]> {
    const keys: string[] = await this.list();
    const extrinsics: ExtrinsicResult<void>[] = [];
    for (const key of keys) {
      extrinsics.push(await this.delete({ key }));
    }
    await this.client.applyAllExtrinsics<void>(extrinsics);
    return keys;
  }
}

export { KVStore };
