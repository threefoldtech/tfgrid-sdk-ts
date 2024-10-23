import { BaseError } from "../base_error";
import { ErrorModules } from "../modules";

export enum Errors {
  UnverifiedError,
  InvalidResponseError,
  RateLimitError,
  InvalidChallengeError,
  InvalidSignatureError,
  UnknownStatusError,
  InvalidAddressError,
  AlreadyVerifiedError,
}

export class TFGridKycError extends BaseError {
  constructor(name = "TFGridKycError", code: number, message: string, public statusCode = -1) {
    super(name, code, message, ErrorModules.KYC);
  }
}

export class KycInvalidResponseError extends TFGridKycError {
  constructor(message: string) {
    super("KycInvalidResponseError", Errors.InvalidResponseError, message);
  }
}

export class KycUnverifiedError extends TFGridKycError {
  constructor(message: string) {
    super("KycUnverifiedError", Errors.UnverifiedError, message);
  }
}

export class KycRateLimitError extends TFGridKycError {
  constructor(message: string) {
    super("KycRateLimitError", Errors.RateLimitError, message);
  }
}

export class KycInvalidAddressError extends TFGridKycError {
  constructor(message: string) {
    super("KycInvalidAddressError", Errors.InvalidAddressError, message);
  }
}

export class KycInvalidChallengeError extends TFGridKycError {
  constructor(message: string) {
    super("KycInvalidChallengeError", Errors.InvalidChallengeError, message);
  }
}

export class KycInvalidSignatureError extends TFGridKycError {
  constructor(message: string) {
    super("KycInvalidSignatureError", Errors.InvalidSignatureError, message);
  }
}

export class KycInsufficientBalanceError extends TFGridKycError {
  constructor(message: string) {
    super("KycInsufficientBalanceError", Errors.UnknownStatusError, message);
  }
}
export class KycAlreadyVerifiedError extends TFGridKycError {
  constructor(message: string) {
    super("KycAlreadyVerifiedError", Errors.AlreadyVerifiedError, message);
  }
}
