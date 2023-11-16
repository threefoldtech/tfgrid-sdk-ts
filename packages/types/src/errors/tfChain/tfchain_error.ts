import { BaseError, Generic } from "../base_error";

export class TFChainError extends BaseError {
  constructor(message: string) {
    super(Generic.TFChainError, message, "Generic");
  }
}
