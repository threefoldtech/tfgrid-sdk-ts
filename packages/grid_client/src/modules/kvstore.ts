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
