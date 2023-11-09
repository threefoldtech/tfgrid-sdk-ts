import type { GridClient } from "../client";

type GridClientCtor = { new (...args: any[]): GridClient; migrated: Set<string> };

export async function migrateKeysDecryption(this: GridClient, GridClient: GridClientCtor): Promise<void> {
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
    GridClient.migrated.add(this._migrationKey);
  } catch (error) {
    console.log("Failed to migrate all keys", error.message || error);
  }
}
