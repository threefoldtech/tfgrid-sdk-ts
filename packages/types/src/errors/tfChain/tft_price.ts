import { BaseError } from "../base_error";

export enum Errors {
  ErrFetchingPrice = 1,
  OffchainSignedTxError,
  NoLocalAcctForSigning,
  AccountUnauthorizedToSetPrice,
  MaxPriceBelowMinPriceError,
  MinPriceAboveMaxPriceError,
  IsNotAnAuthority,
  WrongAuthority,
}

export class ErrFetchingPrice extends BaseError {
  constructor(message: string) {
    super(Errors.ErrFetchingPrice, message);
  }
}

export class OffchainSignedTxError extends BaseError {
  constructor(message: string) {
    super(Errors.OffchainSignedTxError, message);
  }
}

export class NoLocalAcctForSigning extends BaseError {
  constructor(message: string) {
    super(Errors.NoLocalAcctForSigning, message);
  }
}

export class AccountUnauthorizedToSetPrice extends BaseError {
  constructor(message: string) {
    super(Errors.AccountUnauthorizedToSetPrice, message);
  }
}

export class MaxPriceBelowMinPriceError extends BaseError {
  constructor(message: string) {
    super(Errors.MaxPriceBelowMinPriceError, message);
  }
}

export class MinPriceAboveMaxPriceError extends BaseError {
  constructor(message: string) {
    super(Errors.MinPriceAboveMaxPriceError, message);
  }
}

export class IsNotAnAuthority extends BaseError {
  constructor(message: string) {
    super(Errors.IsNotAnAuthority, message);
  }
}

export class WrongAuthority extends BaseError {
  constructor(message: string) {
    super(Errors.WrongAuthority, message);
  }
}
