import { BaseError, Generic } from "../base_error";
import { ErrorModules } from "../modules";

export class GridClientError extends BaseError {
  constructor(message: string) {
    super(Generic.GridClientError, message, ErrorModules.Generic);
  }
}
