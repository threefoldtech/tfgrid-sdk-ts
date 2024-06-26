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

/**
 * Represents a class that provides an abstraction for interacting with different backend storage implementations.
 * The class allows for loading, listing, removing, dumping, and updating data in the storage.
 */
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

  /**
   * Checks if the environment is Node.js by verifying the existence of the 'process' object and the 'process.versions.node' property.
   *
   * @returns A boolean value indicating whether the code is running in a Node.js environment.
   */
  static isEnvNode(): boolean {
    return (
      typeof process === "object" &&
      typeof process.versions === "object" &&
      typeof process.versions.node !== "undefined"
    );
  }

  /**
   * Loads the value stored under the specified key from the storage.
   *
   * @param key The key of the value to be loaded.
   * @returns A promise that resolves with an object representing the value stored under the key.
   */
  async load(key: string): Promise<Record<string, string>> {
    const data = await this.storage.get(key);
    return JSON.parse(data.toString());
  }

  /**
   * Retrieves a list of values stored under the specified key from the storage.
   *
   * @param key The key of the values to be retrieved.
   * @returns A promise that resolves with an array of strings representing the values stored under the key.
   */
  list(key: string): Promise<string[]> {
    return this.storage.list(key);
  }

  /**
   * Removes the value stored under the specified key from the storage.
   *
   * @param key The key of the value to be removed.
   * @returns A promise that resolves after removing the value from the storage.
   */
  async remove(key: string) {
    return await this.storage.remove(key);
  }

  /**
   * Saves the provided value under the specified key in the storage.
   *
   * @param key The key under which the value will be stored.
   * @param value The value to be stored, in the form of a key-value pair object.
   * @returns A promise that resolves after saving the value in the storage.
   */
  async dump(key: string, value: Record<string, string>) {
    return await this.storage.set(key, JSON.stringify(value));
  }

  /**
   * Updates the stored data for a specific key by adding or deleting a field.
   *
   * @param key The key to identify the data to be updated.
   * @param field The field within the data to be updated.
   * @param data The new data to be added to the specified field. Defaults to null.
   * @param action The action to be performed, either 'add' or 'delete'. Defaults to 'add'.
   * @returns A promise that resolves after updating the data.
   */
  async update(
    key: string,
    field: string,
    data: string | null = null,
    action: StorageUpdateAction = StorageUpdateAction.add,
  ) {
    let storedData = await this.load(key);
    if (!storedData) {
      storedData = {};
    }
    if (action === StorageUpdateAction.add) {
      Reflect.set(storedData, field, data);
    } else if (action === StorageUpdateAction.delete) {
      delete storedData[field];
    }
    return await this.dump(key, storedData);
  }
}

export { BackendStorage, BackendStorageType, StorageUpdateAction, appPath };
