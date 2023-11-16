import { BaseError } from "../base_error";

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
  constructor(code: number, message: string) {
    super(code, message, "tftBridgeModule");
  }
}

export class ValidatorExists extends TFTBridge {
  constructor(message: string) {
    super(Errors.ValidatorExists, message);
  }
}

export class ValidatorNotExists extends TFTBridge {
  constructor(message: string) {
    super(Errors.ValidatorNotExists, message);
  }
}

export class TransactionValidatorExists extends TFTBridge {
  constructor(message: string) {
    super(Errors.TransactionValidatorExists, message);
  }
}

export class TransactionValidatorNotExists extends TFTBridge {
  constructor(message: string) {
    super(Errors.TransactionValidatorNotExists, message);
  }
}

export class MintTransactionExists extends TFTBridge {
  constructor(message: string) {
    super(Errors.MintTransactionExists, message);
  }
}

export class MintTransactionAlreadyExecuted extends TFTBridge {
  constructor(message: string) {
    super(Errors.MintTransactionAlreadyExecuted, message);
  }
}

export class MintTransactionNotExists extends TFTBridge {
  constructor(message: string) {
    super(Errors.MintTransactionNotExists, message);
  }
}

export class BurnTransactionExists extends TFTBridge {
  constructor(message: string) {
    super(Errors.BurnTransactionExists, message);
  }
}

export class BurnTransactionNotExists extends TFTBridge {
  constructor(message: string) {
    super(Errors.BurnTransactionNotExists, message);
  }
}

export class BurnSignatureExists extends TFTBridge {
  constructor(message: string) {
    super(Errors.BurnSignatureExists, message);
  }
}

export class EnoughBurnSignaturesPresent extends TFTBridge {
  constructor(message: string) {
    super(Errors.EnoughBurnSignaturesPresent, message);
  }
}

export class RefundSignatureExists extends TFTBridge {
  constructor(message: string) {
    super(Errors.RefundSignatureExists, message);
  }
}

export class BurnTransactionAlreadyExecuted extends TFTBridge {
  constructor(message: string) {
    super(Errors.BurnTransactionAlreadyExecuted, message);
  }
}

export class RefundTransactionNotExists extends TFTBridge {
  constructor(message: string) {
    super(Errors.RefundTransactionNotExists, message);
  }
}

export class RefundTransactionAlreadyExecuted extends TFTBridge {
  constructor(message: string) {
    super(Errors.RefundTransactionAlreadyExecuted, message);
  }
}

export class EnoughRefundSignaturesPresent extends TFTBridge {
  constructor(message: string) {
    super(Errors.EnoughRefundSignaturesPresent, message);
  }
}

export class NotEnoughBalanceToSwap extends TFTBridge {
  constructor(message: string) {
    super(Errors.NotEnoughBalanceToSwap, message);
  }
}

export class AmountIsLessThanWithdrawFee extends TFTBridge {
  constructor(message: string) {
    super(Errors.AmountIsLessThanWithdrawFee, message);
  }
}

export class AmountIsLessThanDepositFee extends TFTBridge {
  constructor(message: string) {
    super(Errors.AmountIsLessThanDepositFee, message);
  }
}

export class WrongParametersProvided extends TFTBridge {
  constructor(message: string) {
    super(Errors.WrongParametersProvided, message);
  }
}

export class InvalidStellarPublicKey extends TFTBridge {
  constructor(message: string) {
    super(Errors.InvalidStellarPublicKey, message);
  }
}
