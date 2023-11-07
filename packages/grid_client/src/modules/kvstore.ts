import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { KVStoreBatchRemoveModel, KVStoreGetModel, KVStoreRemoveModel, KVStoreSetModel } from "./models";
import { checkBalance } from "./utils";

class KVStore {
  client: TFClient;
  constructor(public config: GridClientConfig) {
    this.client = config.tfclient;
  }
  @expose
  @validateInput
  @checkBalance
  async set(options: KVStoreSetModel) {
    return (await this.client.kvStore.set(options)).apply();
  }
  @expose
  @validateInput
  async get(options: KVStoreGetModel) {
    if (this.config.oldStoreSecret) {
      const oldBackendStorage = new KVStore({
        ...this.config,
        storePath: this.config.oldStoreSecret as string,
        tfclient: new TFClient(
          this.client.url,
          this.client.mnemonic,
          this.config.oldStoreSecret,
          this.client.keypairType,
        ),
        oldStoreSecret: "",
      });

      try {
        const value = await oldBackendStorage.get(options);

        if (value) {
          const promises = [this.set({ key: options.key, value }), oldBackendStorage.remove(options)];
          const exts: any[] = await Promise.all(promises.flat(1).filter(Boolean));
          await this.client.applyAllExtrinsics(exts.flat(1).filter(Boolean));
        }
      } catch (error) {
        console.log("Failed to load key or key isn't found", error.message || error);
      } finally {
        await oldBackendStorage.client.disconnect();
      }
    }

    return await this.client.kvStore.get(options);
  }

  @expose
  @validateInput
  async list() {
    return await this.client.kvStore.list();
  }

  @expose
  @validateInput
  @checkBalance
  async remove(options: KVStoreRemoveModel) {
    return (await this.client.kvStore.delete(options)).apply();
  }

  @expose
  @validateInput
  @checkBalance
  async removeAll(): Promise<string[]> {
    return this.client.kvStore.deleteAll();
  }

  @expose
  @validateInput
  @checkBalance
  async batchRemove(options: KVStoreBatchRemoveModel): Promise<string[]> {
    return await this.client.kvStore.batchRemove(options);
  }
}

export { KVStore as kvstore };
