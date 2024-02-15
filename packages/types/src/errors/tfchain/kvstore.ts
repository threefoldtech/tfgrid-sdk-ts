import { BaseError } from "../base_error";
import { ErrorModules } from "../modules";
export enum Errors {
  NoValueStored,
  KeyIsTooLarge,
  ValueIsTooLarge,
}

class KVStoreError extends BaseError {
  constructor(name: string, code: number, message: string) {
    super(name, code, message, ErrorModules.TFKVStore);
  }
}
export class NoValueStored extends KVStoreError {
  constructor(message: string) {
    super("NoValueStored", Errors.NoValueStored, message);
  }
}

export class KeyIsTooLarge extends KVStoreError {
  constructor(message: string) {
    super("KeyIsTooLarge", Errors.NoValueStored, message);
  }
}

export class ValueIsTooLarge extends KVStoreError {
  constructor(message: string) {
    super("ValueIsTooLarge", Errors.ValueIsTooLarge, message);
  }
}
