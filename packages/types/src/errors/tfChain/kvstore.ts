import { BaseError } from "..";
export enum Errors {
  NoValueStored = 1,
  KeyIsTooLarge,
  ValueIsTooLarge,
}

export class NoValueStored extends BaseError {
  constructor(message: string) {
    super(Errors.NoValueStored, message);
  }
}

export class KeyIsTooLarge extends BaseError {
  constructor(message: string) {
    super(Errors.NoValueStored, message);
  }
}

export class ValueIsTooLarge extends BaseError {
  constructor(message: string) {
    super(Errors.ValueIsTooLarge, message);
  }
}
