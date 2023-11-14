import * as TFChainErrors from "./tfChain/index";
export class BaseError extends Error {
  constructor(public code: number, message: string) {
    super(message);
  }
}

export { TFChainErrors };
