// TODO check if this is the right place to have this type,
// TODO check if this is better than having enum, and throw two numbers to the user, module index and error index
export type ErrorModules =
  | "GenericError"
  //chain modules
  | "dao"
  | "tfkvStore"
  | "smartContractModule"
  | "tfgridModule"
  | "tftBridgeModule"
  | "tftPriceModule";

export enum GenericErrors {
  TFChainError,
  ValidationError,
  NetworkError,
}
export class BaseError extends Error {
  constructor(public code: number, message: string, public module: ErrorModules) {
    super(message);
    this.name = this.constructor.name;
  }
}
export class TFChainError extends BaseError {
  constructor(message: string) {
    super(GenericErrors.TFChainError, message, "GenericError");
  }
}
export class ValidationError extends BaseError {
  constructor(message: string) {
    super(GenericErrors.ValidationError, message, "GenericError");
  }
}
