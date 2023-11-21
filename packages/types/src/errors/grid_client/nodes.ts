import { BaseError } from "../base_error";
import { ErrorModules } from "../modules";

export enum Errors {
  UnavailableForTwin,
  InvalidResourcesError,
  DiskAllocationError,
}
class TFGridNodesError extends BaseError {
  constructor(code: number, message: string) {
    super(code, message, ErrorModules.Node);
  }
}

export class InvalidResourcesError extends TFGridNodesError {
  constructor(message: string) {
    super(Errors.InvalidResourcesError, message);
  }
}

export class DiskAllocationError extends TFGridNodesError {
  constructor(message: string) {
    super(Errors.DiskAllocationError, message);
  }
}
