import { ExtrinsicResult } from "@threefold/tfchain_client";

interface BackendStorageInterface {
  // get a value from the storage
  get(key: string);

  // set a value in the storage
  set(key: string, value: string);

  // remove a value from the storage
  remove(key: string);

  // list all keys in the storage
  list(key: string);

  // This method currently only implemented in tfkvstore
  moveValue?(fromKey: string, toKey: string): Promise<ExtrinsicResult<void>[]>;
}

export default BackendStorageInterface;
