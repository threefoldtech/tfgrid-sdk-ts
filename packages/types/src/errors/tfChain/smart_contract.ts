import { BaseError } from "../base_error";
import { ErrorModules } from "../modules";
export enum Errors {
  TwinNotExists,
  NodeNotExists,
  FarmNotExists,
  FarmHasNotEnoughPublicIPs,
  FarmHasNotEnoughPublicIPsFree,
  FailedToReserveIP,
  FailedToFreeIPs,
  ContractNotExists,
  TwinNotAuthorizedToUpdateContract,
  TwinNotAuthorizedToCancelContract,
  NodeNotAuthorizedToDeployContract,
  NodeNotAuthorizedToComputeReport,
  PricingPolicyNotExists,
  ContractIsNotUnique,
  ContractWrongBillingLoopIndex,
  NameExists,
  NameNotValid,
  InvalidContractType,
  TFTPriceValueError,
  NotEnoughResourcesOnNode,
  NodeNotAuthorizedToReportResources,
  MethodIsDeprecated,
  NodeHasActiveContracts,
  NodeHasRentContract,
  FarmIsNotDedicated,
  NodeNotAvailableToDeploy,
  CannotUpdateContractInGraceState,
  NumOverflow,
  OffchainSignedTxCannotSign,
  OffchainSignedTxAlreadySent,
  OffchainSignedTxNoLocalAccountAvailable,
  NameContractNameTooShort,
  NameContractNameTooLong,
  InvalidProviderConfiguration,
  NoSuchSolutionProvider,
  SolutionProviderNotApproved,
  TwinNotAuthorized,
  ServiceContractNotExists,
  ServiceContractCreationNotAllowed,
  ServiceContractModificationNotAllowed,
  ServiceContractApprovalNotAllowed,
  ServiceContractRejectionNotAllowed,
  ServiceContractBillingNotApprovedByBoth,
  ServiceContractBillingVariableAmountTooHigh,
  ServiceContractBillMetadataTooLong,
  ServiceContractMetadataTooLong,
  ServiceContractNotEnoughFundsToPayBill,
  CanOnlyIncreaseFrequency,
  IsNotAnAuthority,
  WrongAuthority,
  UnauthorizedToChangeSolutionProviderId,
  UnauthorizedToSetExtraFee,
}
class SmartContractError extends BaseError {
  constructor(code: number, message: string) {
    super(code, message, ErrorModules.SmartContract);
  }
}
export class TwinNotExists extends SmartContractError {
  constructor(message: string) {
    super(Errors.TwinNotExists, message);
  }
}

export class NodeNotExists extends SmartContractError {
  constructor(message: string) {
    super(Errors.NodeNotExists, message);
  }
}

export class FarmNotExists extends SmartContractError {
  constructor(message: string) {
    super(Errors.FarmNotExists, message);
  }
}

export class FarmHasNotEnoughPublicIPs extends SmartContractError {
  constructor(message: string) {
    super(Errors.FarmHasNotEnoughPublicIPs, message);
  }
}

export class FarmHasNotEnoughPublicIPsFree extends SmartContractError {
  constructor(message: string) {
    super(Errors.FarmHasNotEnoughPublicIPsFree, message);
  }
}

export class FailedToReserveIP extends SmartContractError {
  constructor(message: string) {
    super(Errors.FailedToReserveIP, message);
  }
}

export class FailedToFreeIPs extends SmartContractError {
  constructor(message: string) {
    super(Errors.FailedToFreeIPs, message);
  }
}

export class ContractNotExists extends SmartContractError {
  constructor(message: string) {
    super(Errors.ContractNotExists, message);
  }
}

export class TwinNotAuthorizedToUpdateContract extends SmartContractError {
  constructor(message: string) {
    super(Errors.TwinNotAuthorizedToUpdateContract, message);
  }
}

export class TwinNotAuthorizedToCancelContract extends SmartContractError {
  constructor(message: string) {
    super(Errors.TwinNotAuthorizedToCancelContract, message);
  }
}

export class NodeNotAuthorizedToDeployContract extends SmartContractError {
  constructor(message: string) {
    super(Errors.NodeNotAuthorizedToDeployContract, message);
  }
}

export class NodeNotAuthorizedToComputeReport extends SmartContractError {
  constructor(message: string) {
    super(Errors.NodeNotAuthorizedToComputeReport, message);
  }
}

export class PricingPolicyNotExists extends SmartContractError {
  constructor(message: string) {
    super(Errors.PricingPolicyNotExists, message);
  }
}

export class ContractIsNotUnique extends SmartContractError {
  constructor(message: string) {
    super(Errors.ContractIsNotUnique, message);
  }
}

export class ContractWrongBillingLoopIndex extends SmartContractError {
  constructor(message: string) {
    super(Errors.ContractWrongBillingLoopIndex, message);
  }
}

export class NameExists extends SmartContractError {
  constructor(message: string) {
    super(Errors.NameExists, message);
  }
}

export class NameNotValid extends SmartContractError {
  constructor(message: string) {
    super(Errors.NameNotValid, message);
  }
}

export class InvalidContractType extends SmartContractError {
  constructor(message: string) {
    super(Errors.InvalidContractType, message);
  }
}

export class TFTPriceValueError extends SmartContractError {
  constructor(message: string) {
    super(Errors.TFTPriceValueError, message);
  }
}

export class NotEnoughResourcesOnNode extends SmartContractError {
  constructor(message: string) {
    super(Errors.NotEnoughResourcesOnNode, message);
  }
}

export class NodeNotAuthorizedToReportResources extends SmartContractError {
  constructor(message: string) {
    super(Errors.NodeNotAuthorizedToReportResources, message);
  }
}

export class MethodIsDeprecated extends SmartContractError {
  constructor(message: string) {
    super(Errors.MethodIsDeprecated, message);
  }
}

export class NodeHasActiveContracts extends SmartContractError {
  constructor(message: string) {
    super(Errors.NodeHasActiveContracts, message);
  }
}

export class NodeHasRentContract extends SmartContractError {
  constructor(message: string) {
    super(Errors.NodeHasRentContract, message);
  }
}

export class FarmIsNotDedicated extends SmartContractError {
  constructor(message: string) {
    super(Errors.FarmIsNotDedicated, message);
  }
}

export class NodeNotAvailableToDeploy extends SmartContractError {
  constructor(message: string) {
    super(Errors.NodeNotAvailableToDeploy, message);
  }
}

export class CannotUpdateContractInGraceState extends SmartContractError {
  constructor(message: string) {
    super(Errors.CannotUpdateContractInGraceState, message);
  }
}

export class NumOverflow extends SmartContractError {
  constructor(message: string) {
    super(Errors.NumOverflow, message);
  }
}

export class OffchainSignedTxCannotSign extends SmartContractError {
  constructor(message: string) {
    super(Errors.OffchainSignedTxCannotSign, message);
  }
}

export class OffchainSignedTxAlreadySent extends SmartContractError {
  constructor(message: string) {
    super(Errors.OffchainSignedTxAlreadySent, message);
  }
}

export class OffchainSignedTxNoLocalAccountAvailable extends SmartContractError {
  constructor(message: string) {
    super(Errors.OffchainSignedTxNoLocalAccountAvailable, message);
  }
}

export class NameContractNameTooShort extends SmartContractError {
  constructor(message: string) {
    super(Errors.NameContractNameTooShort, message);
  }
}

export class NameContractNameTooLong extends SmartContractError {
  constructor(message: string) {
    super(Errors.NameContractNameTooLong, message);
  }
}

export class InvalidProviderConfiguration extends SmartContractError {
  constructor(message: string) {
    super(Errors.InvalidProviderConfiguration, message);
  }
}

export class NoSuchSolutionProvider extends SmartContractError {
  constructor(message: string) {
    super(Errors.NoSuchSolutionProvider, message);
  }
}

export class SolutionProviderNotApproved extends SmartContractError {
  constructor(message: string) {
    super(Errors.SolutionProviderNotApproved, message);
  }
}

export class TwinNotAuthorized extends SmartContractError {
  constructor(message: string) {
    super(Errors.TwinNotAuthorized, message);
  }
}

export class ServiceContractNotExists extends SmartContractError {
  constructor(message: string) {
    super(Errors.ServiceContractNotExists, message);
  }
}

export class ServiceContractCreationNotAllowed extends SmartContractError {
  constructor(message: string) {
    super(Errors.ServiceContractCreationNotAllowed, message);
  }
}

export class ServiceContractModificationNotAllowed extends SmartContractError {
  constructor(message: string) {
    super(Errors.ServiceContractModificationNotAllowed, message);
  }
}

export class ServiceContractApprovalNotAllowed extends SmartContractError {
  constructor(message: string) {
    super(Errors.ServiceContractApprovalNotAllowed, message);
  }
}

export class ServiceContractRejectionNotAllowed extends SmartContractError {
  constructor(message: string) {
    super(Errors.ServiceContractRejectionNotAllowed, message);
  }
}

export class ServiceContractBillingNotApprovedByBoth extends SmartContractError {
  constructor(message: string) {
    super(Errors.ServiceContractBillingNotApprovedByBoth, message);
  }
}

export class ServiceContractBillingVariableAmountTooHigh extends SmartContractError {
  constructor(message: string) {
    super(Errors.ServiceContractBillingVariableAmountTooHigh, message);
  }
}

export class ServiceContractBillMetadataTooLong extends SmartContractError {
  constructor(message: string) {
    super(Errors.ServiceContractBillMetadataTooLong, message);
  }
}

export class ServiceContractMetadataTooLong extends SmartContractError {
  constructor(message: string) {
    super(Errors.ServiceContractMetadataTooLong, message);
  }
}

export class ServiceContractNotEnoughFundsToPayBill extends SmartContractError {
  constructor(message: string) {
    super(Errors.ServiceContractNotEnoughFundsToPayBill, message);
  }
}

export class CanOnlyIncreaseFrequency extends SmartContractError {
  constructor(message: string) {
    super(Errors.CanOnlyIncreaseFrequency, message);
  }
}

export class IsNotAnAuthority extends SmartContractError {
  constructor(message: string) {
    super(Errors.IsNotAnAuthority, message);
  }
}

export class WrongAuthority extends SmartContractError {
  constructor(message: string) {
    super(Errors.WrongAuthority, message);
  }
}

export class UnauthorizedToChangeSolutionProviderId extends SmartContractError {
  constructor(message: string) {
    super(Errors.UnauthorizedToChangeSolutionProviderId, message);
  }
}

export class UnauthorizedToSetExtraFee extends SmartContractError {
  constructor(message: string) {
    super(Errors.UnauthorizedToSetExtraFee, message);
  }
}
