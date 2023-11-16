import { BaseError } from "../base_error";
import { ErrorModules } from "../modules";

export enum Errors {
  ErrFetchingPrice,
  OffchainSignedTxError,
  NoLocalAcctForSigning,
  AccountUnauthorizedToSetPrice,
  MaxPriceBelowMinPriceError,
  MinPriceAboveMaxPriceError,
  IsNotAnAuthority,
  WrongAuthority,
}

class TFTPrice extends BaseError {
  constructor(code: number, message: string) {
    super(code, message, ErrorModules.TFTPrice);
  }
}
export class ErrFetchingPrice extends TFTPrice {
  constructor(message: string) {
    super(Errors.ErrFetchingPrice, message);
  }
}

export class OffchainSignedTxError extends TFTPrice {
  constructor(message: string) {
    super(Errors.OffchainSignedTxError, message);
  }
}

export class NoLocalAcctForSigning extends TFTPrice {
  constructor(message: string) {
    super(Errors.NoLocalAcctForSigning, message);
  }
}

export class AccountUnauthorizedToSetPrice extends TFTPrice {
  constructor(message: string) {
    super(Errors.AccountUnauthorizedToSetPrice, message);
  }
}

export class MaxPriceBelowMinPriceError extends TFTPrice {
  constructor(message: string) {
    super(Errors.MaxPriceBelowMinPriceError, message);
  }
}

export class MinPriceAboveMaxPriceError extends TFTPrice {
  constructor(message: string) {
    super(Errors.MinPriceAboveMaxPriceError, message);
  }
}

export class IsNotAnAuthority extends TFTPrice {
  constructor(message: string) {
    super(Errors.IsNotAnAuthority, message);
  }
}

export class WrongAuthority extends TFTPrice {
  constructor(message: string) {
    super(Errors.WrongAuthority, message);
  }
}
