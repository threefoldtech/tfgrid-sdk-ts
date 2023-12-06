import AwaitLock from "await-lock";

import type { GridClient } from "../client";

type GridClientCtor = {
  new (...args: any[]): GridClient;
  migrated: Set<string>;
  migrationLock: Map<string, AwaitLock>;
};

export async function migrateKeysEncryption(this: GridClient, GridClient: GridClientCtor): Promise<void> {
  const migrationKey = this.config.mnemonic + this.config.network + this.config.storeSecret + this._mnemonic;

  const _migrateKeysEncryption = async () => {
    const grid = new GridClient({
      ...this.config,
      storeSecret: this._mnemonic as string,
    });

    const __getValue = (key: string) => {
      return grid.kvstore.get({ key }).catch(() => null);
    };

    const __migrateKey = (key: string, value: string | null) => {
      if (!value) {
        return [];
      }

      return this.tfclient.kvStore.set({ key, value });
    };

    try {
      await grid.connect();

      const keys = await grid.kvstore.list();
      const values = await Promise.all(keys.map(__getValue));

      const promises = values.map((value, i) => __migrateKey(keys[i], value));
      const exts = await Promise.all(promises.flat(1).filter(Boolean));

      await this.tfclient.applyAllExtrinsics(exts.flat(1).filter(Boolean));
      GridClient.migrated.add(migrationKey);
    } catch (error) {
      console.log("Failed to migrate all keys", error.message || error);
    }
  };

  if (this._mnemonic && this.config.storeSecret !== this._mnemonic && !GridClient.migrated.has(migrationKey)) {
    if (!GridClient.migrationLock.has(migrationKey)) {
      GridClient.migrationLock.set(migrationKey, new AwaitLock());
    }

    const lock = GridClient.migrationLock.get(migrationKey);

    if (lock) {
      try {
        await lock.acquireAsync();
        if (!GridClient.migrated.has(migrationKey)) {
          await _migrateKeysEncryption();
        }
      } catch (error) {
        console.log("Failed to migrate all keys", error.message || error);
      } finally {
        if (lock.acquired) {
          lock.release();
          GridClient.migrationLock.delete(migrationKey);
        }
      }
    }
  }
}
