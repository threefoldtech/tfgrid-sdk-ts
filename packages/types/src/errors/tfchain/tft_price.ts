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
  constructor(name: string, code: number, message: string) {
    super(name, code, message, ErrorModules.TFTPrice);
  }
}
export class ErrFetchingPrice extends TFTPrice {
  constructor(message: string) {
    super("ErrFetchingPrice", Errors.ErrFetchingPrice, message);
  }
}

export class OffchainSignedTxError extends TFTPrice {
  constructor(message: string) {
    super("OffchainSignedTxError", Errors.OffchainSignedTxError, message);
  }
}

export class NoLocalAcctForSigning extends TFTPrice {
  constructor(message: string) {
    super("NoLocalAcctForSigning", Errors.NoLocalAcctForSigning, message);
  }
}

export class AccountUnauthorizedToSetPrice extends TFTPrice {
  constructor(message: string) {
    super("AccountUnauthorizedToSetPrice", Errors.AccountUnauthorizedToSetPrice, message);
  }
}

export class MaxPriceBelowMinPriceError extends TFTPrice {
  constructor(message: string) {
    super("MaxPriceBelowMinPriceError", Errors.MaxPriceBelowMinPriceError, message);
  }
}

export class MinPriceAboveMaxPriceError extends TFTPrice {
  constructor(message: string) {
    super("MinPriceAboveMaxPriceError", Errors.MinPriceAboveMaxPriceError, message);
  }
}

export class IsNotAnAuthority extends TFTPrice {
  constructor(message: string) {
    super("IsNotAnAuthority", Errors.IsNotAnAuthority, message);
  }
}

export class WrongAuthority extends TFTPrice {
  constructor(message: string) {
    super("WrongAuthority", Errors.WrongAuthority, message);
  }
}
