import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { KVStoreBatchRemoveModel, KVStoreGetModel, KVStoreRemoveModel, KVStoreSetModel } from "./models";
import { checkBalance } from "./utils";

class KVStore {
    client: TFClient;
    constructor(config: GridClientConfig) {
        this.client = new TFClient(config.substrateURL, config.mnemonic, config.storeSecret, config.keypairType);
    }
    @expose
    @validateInput
    @checkBalance
    async set(options: KVStoreSetModel) {
        return await this.client.kvStore.set(options.key, options.value);
    }
    @expose
    @validateInput
    async get(options: KVStoreGetModel) {
        return await this.client.kvStore.get(options.key);
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
        return await this.client.kvStore.remove(options.key);
    }

    @expose
    @validateInput
    @checkBalance
    async removeAll(): Promise<string[]> {
        return await this.client.kvStore.removeAll();
    }

    @expose
    @validateInput
    @checkBalance
    async batchRemove(options: KVStoreBatchRemoveModel): Promise<string[]> {
        return await this.client.kvStore.batchRemove(options.keys);
    }
}

export { KVStore as kvstore };
