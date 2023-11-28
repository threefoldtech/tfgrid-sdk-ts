import { ValidationError } from "@threefold/types";
import getAppDataPath from "appdata-path";
import * as PATH from "path";

import { KeypairType } from "../zos/deployment";
import BackendStorageInterface from "./BackendStorageInterface";
import { LocalStorage } from "./localstorage";
import { PKID } from "./pkid";
import { TFKVStoreBackend } from "./tfkvstore";

const appsPath = getAppDataPath();
const appPath = PATH.join(appsPath, "grid3_client");

enum StorageUpdateAction {
  add = "add",
  delete = "delete",
}

enum BackendStorageType {
  auto = "auto",
  fs = "fs",
  localstorage = "localstorage",
  tfkvstore = "tfkvstore",
  pkid = "pkid",
}

class BackendStorage {
  storage: BackendStorageInterface;
  constructor(
    public type: BackendStorageType = BackendStorageType.auto,
    substrateURL = "",
    mnemonic = "",
    storeSecret?: string | Uint8Array,
    keypairType?: KeypairType,
    public backendStorage?: BackendStorageInterface,
    seed = "",
  ) {
    // in case there is a backend interface given
    if (this.backendStorage) {
      this.storage = this.backendStorage;
      return;
    }

    // in case there is no backend interface given
    if (type === BackendStorageType.auto) {
      if (BackendStorage.isEnvNode()) {
        const storage = require("./filesystem");
        this.storage = new storage.FS();
      } else {
        this.storage = new LocalStorage();
      }
    } else if (type === BackendStorageType.tfkvstore) {
      this.storage = new TFKVStoreBackend(substrateURL, mnemonic, storeSecret, keypairType);
    } else if (type === BackendStorageType.pkid) {
      this.storage = new PKID(seed);
    } else if (type === BackendStorageType.fs) {
      const storage = require("./filesystem");
      this.storage = new storage.FS();
    } else if (type === BackendStorageType.localstorage) {
      const storage = require("./localstorage");
      this.storage = new storage.LocalStorage();
    } else {
      throw new ValidationError("Unsupported type for backend.");
    }
  }

  static isEnvNode(): boolean {
    return (
      typeof process === "object" &&
      typeof process.versions === "object" &&
      typeof process.versions.node !== "undefined"
    );
  }

  async load(key: string) {
    const data = await this.storage.get(key);
    return JSON.parse(data.toString());
  }

  list(key: string): Promise<string[]> {
    return this.storage.list(key);
  }

  async remove(key: string) {
    return await this.storage.remove(key);
  }

  async dump(key: string, value) {
    return await this.storage.set(key, JSON.stringify(value));
  }

  async update(key: string, field: string, data = null, action: StorageUpdateAction = StorageUpdateAction.add) {
    let storedData = await this.load(key);
    if (!storedData) {
      storedData = {};
    }
    if (action === StorageUpdateAction.add) {
      storedData[field] = data;
    } else if (action === StorageUpdateAction.delete) {
      delete storedData[field];
    }
    return await this.dump(key, storedData);
  }
}

export { BackendStorage, BackendStorageType, StorageUpdateAction, appPath };
