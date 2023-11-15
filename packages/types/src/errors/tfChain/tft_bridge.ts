import { BaseError } from "..";

export enum Errors {
  ValidatorExists = 1,
  ValidatorNotExists,
  TransactionValidatorExists,
  TransactionValidatorNotExists,
  MintTransactionExists,
  MintTransactionAlreadyExecuted,
  MintTransactionNotExists,
  BurnTransactionExists,
  BurnTransactionNotExists,
  BurnSignatureExists,
  EnoughBurnSignaturesPresent,
  RefundSignatureExists,
  BurnTransactionAlreadyExecuted,
  RefundTransactionNotExists,
  RefundTransactionAlreadyExecuted,
  EnoughRefundSignaturesPresent,
  NotEnoughBalanceToSwap,
  AmountIsLessThanWithdrawFee,
  AmountIsLessThanDepositFee,
  WrongParametersProvided,
  InvalidStellarPublicKey,
}

export class ValidatorExists extends BaseError {
  constructor(message: string) {
    super(Errors.ValidatorExists, message);
  }
}

export class ValidatorNotExists extends BaseError {
  constructor(message: string) {
    super(Errors.ValidatorNotExists, message);
  }
}

export class TransactionValidatorExists extends BaseError {
  constructor(message: string) {
    super(Errors.TransactionValidatorExists, message);
  }
}

export class TransactionValidatorNotExists extends BaseError {
  constructor(message: string) {
    super(Errors.TransactionValidatorNotExists, message);
  }
}

export class MintTransactionExists extends BaseError {
  constructor(message: string) {
    super(Errors.MintTransactionExists, message);
  }
}

export class MintTransactionAlreadyExecuted extends BaseError {
  constructor(message: string) {
    super(Errors.MintTransactionAlreadyExecuted, message);
  }
}

export class MintTransactionNotExists extends BaseError {
  constructor(message: string) {
    super(Errors.MintTransactionNotExists, message);
  }
}

export class BurnTransactionExists extends BaseError {
  constructor(message: string) {
    super(Errors.BurnTransactionExists, message);
  }
}

export class BurnTransactionNotExists extends BaseError {
  constructor(message: string) {
    super(Errors.BurnTransactionNotExists, message);
  }
}

export class BurnSignatureExists extends BaseError {
  constructor(message: string) {
    super(Errors.BurnSignatureExists, message);
  }
}

export class EnoughBurnSignaturesPresent extends BaseError {
  constructor(message: string) {
    super(Errors.EnoughBurnSignaturesPresent, message);
  }
}

export class RefundSignatureExists extends BaseError {
  constructor(message: string) {
    super(Errors.RefundSignatureExists, message);
  }
}

export class BurnTransactionAlreadyExecuted extends BaseError {
  constructor(message: string) {
    super(Errors.BurnTransactionAlreadyExecuted, message);
  }
}

export class RefundTransactionNotExists extends BaseError {
  constructor(message: string) {
    super(Errors.RefundTransactionNotExists, message);
  }
}

export class RefundTransactionAlreadyExecuted extends BaseError {
  constructor(message: string) {
    super(Errors.RefundTransactionAlreadyExecuted, message);
  }
}

export class EnoughRefundSignaturesPresent extends BaseError {
  constructor(message: string) {
    super(Errors.EnoughRefundSignaturesPresent, message);
  }
}

export class NotEnoughBalanceToSwap extends BaseError {
  constructor(message: string) {
    super(Errors.NotEnoughBalanceToSwap, message);
  }
}

export class AmountIsLessThanWithdrawFee extends BaseError {
  constructor(message: string) {
    super(Errors.AmountIsLessThanWithdrawFee, message);
  }
}

export class AmountIsLessThanDepositFee extends BaseError {
  constructor(message: string) {
    super(Errors.AmountIsLessThanDepositFee, message);
  }
}

export class WrongParametersProvided extends BaseError {
  constructor(message: string) {
    super(Errors.WrongParametersProvided, message);
  }
}

export class InvalidStellarPublicKey extends BaseError {
  constructor(message: string) {
    super(Errors.InvalidStellarPublicKey, message);
  }
}
