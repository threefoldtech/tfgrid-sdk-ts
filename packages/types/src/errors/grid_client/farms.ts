import { BaseError } from "../base_error";
import { ErrorModules } from "../modules";

export enum Errors {
  InvalidResourcesError,
  FarmerBotError,
  NodeSelectionError,
}
class TFGridFarmsError extends BaseError {
  constructor(code: number, message: string) {
    super(code, message, ErrorModules.Farm);
  }
}

export class InvalidResourcesError extends TFGridFarmsError {
  constructor(message: string) {
    super(Errors.InvalidResourcesError, message);
  }
}

export class FarmerBotError extends TFGridFarmsError {
  constructor(message: string) {
    super(Errors.FarmerBotError, message);
  }
}

export class NodeSelectionError extends TFGridFarmsError {
  constructor(message: string) {
    super(Errors.NodeSelectionError, message);
  }
}
