import { ErrorModules } from "./modules";

export enum Generic {
  TFChainError,
  GridClientError,
  ValidationError,
  TimeoutError,
  ConnectionError,
  RMBError,
}
export class BaseError extends Error {
  constructor(public code: number, message: string, public module: ErrorModules) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(Generic.ValidationError, message, ErrorModules.Generic);
  }
}
export class TimeoutError extends BaseError {
  constructor(message: string) {
    super(Generic.TimeoutError, message, ErrorModules.Generic);
  }
}

export class ConnectionError extends BaseError {
  constructor(message: string) {
    super(Generic.ConnectionError, message, ErrorModules.Generic);
  }
}

export class RMBError extends BaseError {
  constructor(message: string) {
    super(Generic.RMBError, message, ErrorModules.Generic);
  }
}
