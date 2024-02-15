import { BaseError } from "../base_error";
import { ErrorModules } from "../modules";

export enum Errors {
  InvalidResourcesError,
  FarmerBotError,
  NodeSelectionError,
}
class TFGridFarmsError extends BaseError {
  constructor(name = "TFGridFarmsError", code: number, message: string) {
    super(name, code, message, ErrorModules.Farm);
  }
}

export class InvalidResourcesError extends TFGridFarmsError {
  constructor(message: string) {
    super("InvalidResourcesError", Errors.InvalidResourcesError, message);
  }
}

export class FarmerBotError extends TFGridFarmsError {
  constructor(message: string) {
    super("FarmerBotError", Errors.FarmerBotError, message);
  }
}

export class NodeSelectionError extends TFGridFarmsError {
  constructor(message: string) {
    super("NodeSelectionError", Errors.NodeSelectionError, message);
  }
}
