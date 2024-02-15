import { BaseError } from "../base_error";
import { ErrorModules } from "../modules";

export enum Errors {
  ValidatorExists,
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

class TFTBridge extends BaseError {
  constructor(name: string, code: number, message: string) {
    super(name, code, message, ErrorModules.TFTBridge);
  }
}

export class ValidatorExists extends TFTBridge {
  constructor(message: string) {
    super("ValidatorExists", Errors.ValidatorExists, message);
  }
}

export class ValidatorNotExists extends TFTBridge {
  constructor(message: string) {
    super("ValidatorNotExists", Errors.ValidatorNotExists, message);
  }
}

export class TransactionValidatorExists extends TFTBridge {
  constructor(message: string) {
    super("TransactionValidatorExists", Errors.TransactionValidatorExists, message);
  }
}

export class TransactionValidatorNotExists extends TFTBridge {
  constructor(message: string) {
    super("TransactionValidatorNotExists", Errors.TransactionValidatorNotExists, message);
  }
}

export class MintTransactionExists extends TFTBridge {
  constructor(message: string) {
    super("MintTransactionExists", Errors.MintTransactionExists, message);
  }
}

export class MintTransactionAlreadyExecuted extends TFTBridge {
  constructor(message: string) {
    super("MintTransactionAlreadyExecuted", Errors.MintTransactionAlreadyExecuted, message);
  }
}

export class MintTransactionNotExists extends TFTBridge {
  constructor(message: string) {
    super("MintTransactionNotExists", Errors.MintTransactionNotExists, message);
  }
}

export class BurnTransactionExists extends TFTBridge {
  constructor(message: string) {
    super("BurnTransactionExists", Errors.BurnTransactionExists, message);
  }
}

export class BurnTransactionNotExists extends TFTBridge {
  constructor(message: string) {
    super("BurnTransactionNotExists", Errors.BurnTransactionNotExists, message);
  }
}

export class BurnSignatureExists extends TFTBridge {
  constructor(message: string) {
    super("BurnSignatureExists", Errors.BurnSignatureExists, message);
  }
}

export class EnoughBurnSignaturesPresent extends TFTBridge {
  constructor(message: string) {
    super("EnoughBurnSignaturesPresent", Errors.EnoughBurnSignaturesPresent, message);
  }
}

export class RefundSignatureExists extends TFTBridge {
  constructor(message: string) {
    super("RefundSignatureExists", Errors.RefundSignatureExists, message);
  }
}

export class BurnTransactionAlreadyExecuted extends TFTBridge {
  constructor(message: string) {
    super("BurnTransactionAlreadyExecuted", Errors.BurnTransactionAlreadyExecuted, message);
  }
}

export class RefundTransactionNotExists extends TFTBridge {
  constructor(message: string) {
    super("RefundTransactionNotExists", Errors.RefundTransactionNotExists, message);
  }
}

export class RefundTransactionAlreadyExecuted extends TFTBridge {
  constructor(message: string) {
    super("RefundTransactionAlreadyExecuted", Errors.RefundTransactionAlreadyExecuted, message);
  }
}

export class EnoughRefundSignaturesPresent extends TFTBridge {
  constructor(message: string) {
    super("EnoughRefundSignaturesPresent", Errors.EnoughRefundSignaturesPresent, message);
  }
}

export class NotEnoughBalanceToSwap extends TFTBridge {
  constructor(message: string) {
    super("NotEnoughBalanceToSwap", Errors.NotEnoughBalanceToSwap, message);
  }
}

export class AmountIsLessThanWithdrawFee extends TFTBridge {
  constructor(message: string) {
    super("AmountIsLessThanWithdrawFee", Errors.AmountIsLessThanWithdrawFee, message);
  }
}

export class AmountIsLessThanDepositFee extends TFTBridge {
  constructor(message: string) {
    super("AmountIsLessThanDepositFee", Errors.AmountIsLessThanDepositFee, message);
  }
}

export class WrongParametersProvided extends TFTBridge {
  constructor(message: string) {
    super("WrongParametersProvided", Errors.WrongParametersProvided, message);
  }
}

export class InvalidStellarPublicKey extends TFTBridge {
  constructor(message: string) {
    super("InvalidStellarPublicKey", Errors.InvalidStellarPublicKey, message);
  }
}
