import { BaseError } from "../base_error";
import { ErrorModules } from "../modules";
export enum Errors {
  NoValueStored,
  KeyIsTooLarge,
  ValueIsTooLarge,
}

class KVStoreError extends BaseError {
  constructor(code: number, message: string) {
    super(code, message, ErrorModules.TFKVStore);
  }
}
export class NoValueStored extends KVStoreError {
  constructor(message: string) {
    super(Errors.NoValueStored, message);
  }
}

export class KeyIsTooLarge extends KVStoreError {
  constructor(message: string) {
    super(Errors.NoValueStored, message);
  }
}

export class ValueIsTooLarge extends KVStoreError {
  constructor(message: string) {
    super(Errors.ValueIsTooLarge, message);
  }
}
