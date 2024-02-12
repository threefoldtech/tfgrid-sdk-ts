import { BaseError, Generic } from "../base_error";
import { ErrorModules } from "../modules";

export class TFChainError extends BaseError {
  constructor(message: string) {
    super("TFChainError", Generic.TFChainError, message, ErrorModules.Generic);
  }
}
