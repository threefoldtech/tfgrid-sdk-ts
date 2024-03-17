import { BaseError } from "../base_error";
import { ErrorModules } from "../modules";

export enum Errors {
  UnavailableNodeError,
  InvalidResourcesError,
  DiskAllocationError,
  AccessNodeError,
  GPUNotFoundError,
  GPULockedError,
}
class TFGridNodesError extends BaseError {
  constructor(name = "TFGridNodesError", code: number, message: string) {
    super(name, code, message, ErrorModules.Node);
  }
}

export class InvalidResourcesError extends TFGridNodesError {
  constructor(message: string) {
    super("InvalidResourcesError", Errors.InvalidResourcesError, message);
  }
}

export class DiskAllocationError extends TFGridNodesError {
  constructor(message: string) {
    super("DiskAllocationError", Errors.DiskAllocationError, message);
  }
}

export class AccessNodeError extends TFGridNodesError {
  constructor(message: string) {
    super("AccessNodeError", Errors.AccessNodeError, message);
  }
}

export class UnavailableNodeError extends TFGridNodesError {
  constructor(message: string) {
    super("UnavailableNodeError", Errors.UnavailableNodeError, message);
  }
}

export class GPUNotFoundError extends TFGridNodesError {
  constructor(message: string) {
    super("GPUNotFoundError", Errors.GPUNotFoundError, message);
  }
}

export class GPULockedError extends TFGridNodesError {
  constructor(message: string) {
    super("GPULockedError", Errors.GPULockedError, message);
  }
}
