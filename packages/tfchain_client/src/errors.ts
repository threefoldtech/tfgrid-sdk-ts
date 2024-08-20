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
  args?: AnyTuple | string[];
  docs?: string[];
}

interface TFChainError {
  message: string;
  keyError?: string;
  section?: string;
  method?: string;
  args?: AnyTuple | string[];
  docs?: string[];
}

class TFChainError extends Error {
  constructor(options: ITFChainError) {
    super(options.message);
    this.name = "TFChainError";

    if (!options.keyError) {
      options.keyError = "GenericError";
    }

    Object.keys(options).forEach(key => {
      if (options[key as keyof ITFChainError]) {
        Object.defineProperty(this, key, {
          value: options[key as keyof ITFChainError],
          enumerable: true,
        });
      }
    });
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

  /**
   * Throws a TFChainError based on the type of error encountered:
   * - If the error is a dispatch error:
   *   - If it is a module error, throws a TFChainError with module details.
   *   - If it is a token error, throws a TFChainError with token details.
   *   - If it is an arithmetic error, throws a TFChainError with arithmetic details.
   *   - If it is a bad origin error, throws a TFChainError for bad origin.
   *   - If it is an unknown dispatch error, throws a TFChainError for unknown dispatch error.
   * - If the error is an instance of Error:
   *   - If the message includes "Inability to pay some fees", throws an InsufficientBalanceError.
   *   - Otherwise, throws a TFChainError for a generic error.
   * - If the error is not a dispatch error or an instance of Error, throws a TFChainError for an unknown error.
   * @throw {TFChainError} The specific TFChainError thrown based on the encountered error type.
   */
  throw(): TFChainError {
    const extrinsicArgs = this.extrinsic.method.args;
    const extrinsicMethod = this.extrinsic.method.method;
    const extrinsicSection = this.extrinsic.method.section;
    const errorMessage = `Failed to apply '${extrinsicMethod}' on section '${extrinsicSection}' with args '${extrinsicArgs}.`;

    if (this.isDispatchError(this.error)) {
      if (this.error.isModule) {
        const decoded = this.api.registry.findMetaError(this.error.asModule);
        const { section, name, docs } = decoded;
        throw new TFChainError({
          message: `Module Error: ${errorMessage}'`,
          keyError: name,
          section,
          method: extrinsicMethod,
          args: extrinsicArgs,
          docs,
        });
      } else if (this.error.isToken) {
        const tokenError = this.error.asToken.toHuman();
        throw new TFChainError({
          message: `Token Error: ${errorMessage}`,
          keyError: JSON.stringify(tokenError),
          args: extrinsicArgs,
          method: extrinsicMethod,
          section: extrinsicSection,
          docs: [],
        });
      } else if (this.error.isArithmetic) {
        const tokenError = this.error.asArithmetic.toHuman();
        throw new TFChainError({
          message: `Arithmetic Error: ${errorMessage}`,
          keyError: JSON.stringify(tokenError),
          args: extrinsicArgs,
          method: extrinsicMethod,
          section: extrinsicSection,
          docs: [],
        });
      } else if (this.error.isBadOrigin) {
        throw new TFChainError({
          message: `Bad Origin Error: ${errorMessage}`,
          keyError: "BadOriginError",
          args: extrinsicArgs,
          method: extrinsicMethod,
          section: extrinsicSection,
          docs: [],
        });
      } else {
        throw new TFChainError({
          message: `Unknown Dispatch Error: ${errorMessage}`,
          keyError: "UnknownDispatchError",
          args: extrinsicArgs,
          method: extrinsicMethod,
          section: extrinsicSection,
          docs: [],
        });
      }
    } else if (this.error instanceof Error) {
      if (this.error.message.includes("Inability to pay some fees")) {
        throw new InsufficientBalanceError(`Insufficient Balance Error: ${errorMessage}`);
      } else {
        throw new TFChainError({
          message: `Generic Error: ${errorMessage}`,
          keyError: "GenericError",
        });
      }
    } else {
      throw new TFChainError({
        message: `Unknown Error: ${errorMessage}`,
        keyError: "UnknownError",
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
