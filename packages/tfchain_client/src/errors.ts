import { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import type { DispatchError } from "@polkadot/types/interfaces";
import { ISubmittableResult } from "@polkadot/types/types";
import { AnyTuple } from "@polkadot/types-codec/types";
import { InsufficientBalanceError } from "@threefold/types";

interface ITFChainError {
  message: string;
  keyError?: string;
  section?: string;
  method?: string;
  args?: AnyTuple;
  docs?: string[];
}

class TFChainError extends Error implements ITFChainError {
  args?: AnyTuple;
  keyError?: string;
  section?: string;
  method?: string;
  docs?: string[];

  constructor(options: ITFChainError) {
    super(options.message);
    this.name = "TFChainError";
    this.keyError = options.keyError;
    this.section = options.section;
    this.args = options.args;
    this.method = options.method;
    this.docs = options.docs;
  }
}

class TFChainErrorWrapper {
  error: DispatchError | Error;
  extrinsic: SubmittableExtrinsic<"promise", ISubmittableResult>;
  api: ApiPromise;

  constructor(
    error: DispatchError | Error,
    extrinsic: SubmittableExtrinsic<"promise", ISubmittableResult>,
    api: ApiPromise,
  ) {
    this.error = error;
    this.extrinsic = extrinsic;
    this.api = api;
  }

  throw(): TFChainError {
    const args = this.extrinsic.method.args;
    const method = this.extrinsic.method.method;

    if (this.isDispatchError(this.error)) {
      if (this.error.isModule) {
        const decoded = this.api.registry.findMetaError(this.error.asModule);
        const { section, name, docs } = decoded;
        throw new TFChainError({
          message: `Module error:`,
          keyError: name,
          section,
          args,
          method,
          docs,
        });
      } else if (this.error.isToken) {
        const tokenError = this.error.asToken.toHuman();
        throw new TFChainError({
          message: `Token error:`,
          keyError: JSON.stringify(tokenError),
          args,
          method,
          docs: [],
        });
      } else if (this.error.isArithmetic) {
        const tokenError = this.error.asArithmetic.toHuman();
        throw new TFChainError({
          message: `Arithmetic error:`,
          keyError: JSON.stringify(tokenError),
          args,
          method,
          docs: [],
        });
      } else if (this.error.isBadOrigin) {
        throw new TFChainError({
          message: `Bad origin error:`,
          keyError: "BadOriginError",
          args,
          method,
          docs: [],
        });
      } else {
        throw new TFChainError({
          message: `Unknown dispatch error:`,
          keyError: "UnknownDispatchError",
          args,
          method,
          docs: [],
        });
      }
    } else if (this.error instanceof Error) {
      if (this.error.message.includes("Inability to pay some fees")) {
        throw new InsufficientBalanceError(`Insufficient balance error:`);
      } else {
        throw new TFChainError({
          message: `Generic error:`,
          keyError: "GenericError",
          args,
          method,
          docs: [],
        });
      }
    } else {
      throw new TFChainError({
        message: `Unknown error:`,
        keyError: "UnknownError",
        args,
        method,
        docs: [],
      });
    }
  }

  private isDispatchError(e: any): e is DispatchError {
    return (
      e &&
      typeof e === "object" &&
      "isModule" in e &&
      "isToken" in e &&
      "isArithmetic" in e &&
      "isBadOrigin" in e &&
      "asModule" in e &&
      "asToken" in e &&
      "asArithmetic" in e &&
      "asBadOrigin" in e
    );
  }
}

export { TFChainErrorWrapper, TFChainError, ITFChainError };
