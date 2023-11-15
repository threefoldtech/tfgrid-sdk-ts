import { BaseError } from "../base_error";
export enum Errors {
  TwinNotExists = 1,
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

export class TwinNotExists extends BaseError {
  constructor(message: string) {
    super(Errors.TwinNotExists, message);
  }
}

export class NodeNotExists extends BaseError {
  constructor(message: string) {
    super(Errors.NodeNotExists, message);
  }
}

export class FarmNotExists extends BaseError {
  constructor(message: string) {
    super(Errors.FarmNotExists, message);
  }
}

export class FarmHasNotEnoughPublicIPs extends BaseError {
  constructor(message: string) {
    super(Errors.FarmHasNotEnoughPublicIPs, message);
  }
}

export class FarmHasNotEnoughPublicIPsFree extends BaseError {
  constructor(message: string) {
    super(Errors.FarmHasNotEnoughPublicIPsFree, message);
  }
}

export class FailedToReserveIP extends BaseError {
  constructor(message: string) {
    super(Errors.FailedToReserveIP, message);
  }
}

export class FailedToFreeIPs extends BaseError {
  constructor(message: string) {
    super(Errors.FailedToFreeIPs, message);
  }
}

export class ContractNotExists extends BaseError {
  constructor(message: string) {
    super(Errors.ContractNotExists, message);
  }
}

export class TwinNotAuthorizedToUpdateContract extends BaseError {
  constructor(message: string) {
    super(Errors.TwinNotAuthorizedToUpdateContract, message);
  }
}

export class TwinNotAuthorizedToCancelContract extends BaseError {
  constructor(message: string) {
    super(Errors.TwinNotAuthorizedToCancelContract, message);
  }
}

export class NodeNotAuthorizedToDeployContract extends BaseError {
  constructor(message: string) {
    super(Errors.NodeNotAuthorizedToDeployContract, message);
  }
}

export class NodeNotAuthorizedToComputeReport extends BaseError {
  constructor(message: string) {
    super(Errors.NodeNotAuthorizedToComputeReport, message);
  }
}

export class PricingPolicyNotExists extends BaseError {
  constructor(message: string) {
    super(Errors.PricingPolicyNotExists, message);
  }
}

export class ContractIsNotUnique extends BaseError {
  constructor(message: string) {
    super(Errors.ContractIsNotUnique, message);
  }
}

export class ContractWrongBillingLoopIndex extends BaseError {
  constructor(message: string) {
    super(Errors.ContractWrongBillingLoopIndex, message);
  }
}

export class NameExists extends BaseError {
  constructor(message: string) {
    super(Errors.NameExists, message);
  }
}

export class NameNotValid extends BaseError {
  constructor(message: string) {
    super(Errors.NameNotValid, message);
  }
}

export class InvalidContractType extends BaseError {
  constructor(message: string) {
    super(Errors.InvalidContractType, message);
  }
}

export class TFTPriceValueError extends BaseError {
  constructor(message: string) {
    super(Errors.TFTPriceValueError, message);
  }
}

export class NotEnoughResourcesOnNode extends BaseError {
  constructor(message: string) {
    super(Errors.NotEnoughResourcesOnNode, message);
  }
}

export class NodeNotAuthorizedToReportResources extends BaseError {
  constructor(message: string) {
    super(Errors.NodeNotAuthorizedToReportResources, message);
  }
}

export class MethodIsDeprecated extends BaseError {
  constructor(message: string) {
    super(Errors.MethodIsDeprecated, message);
  }
}

export class NodeHasActiveContracts extends BaseError {
  constructor(message: string) {
    super(Errors.NodeHasActiveContracts, message);
  }
}

export class NodeHasRentContract extends BaseError {
  constructor(message: string) {
    super(Errors.NodeHasRentContract, message);
  }
}

export class FarmIsNotDedicated extends BaseError {
  constructor(message: string) {
    super(Errors.FarmIsNotDedicated, message);
  }
}

export class NodeNotAvailableToDeploy extends BaseError {
  constructor(message: string) {
    super(Errors.NodeNotAvailableToDeploy, message);
  }
}

export class CannotUpdateContractInGraceState extends BaseError {
  constructor(message: string) {
    super(Errors.CannotUpdateContractInGraceState, message);
  }
}

export class NumOverflow extends BaseError {
  constructor(message: string) {
    super(Errors.NumOverflow, message);
  }
}

export class OffchainSignedTxCannotSign extends BaseError {
  constructor(message: string) {
    super(Errors.OffchainSignedTxCannotSign, message);
  }
}

export class OffchainSignedTxAlreadySent extends BaseError {
  constructor(message: string) {
    super(Errors.OffchainSignedTxAlreadySent, message);
  }
}

export class OffchainSignedTxNoLocalAccountAvailable extends BaseError {
  constructor(message: string) {
    super(Errors.OffchainSignedTxNoLocalAccountAvailable, message);
  }
}

export class NameContractNameTooShort extends BaseError {
  constructor(message: string) {
    super(Errors.NameContractNameTooShort, message);
  }
}

export class NameContractNameTooLong extends BaseError {
  constructor(message: string) {
    super(Errors.NameContractNameTooLong, message);
  }
}

export class InvalidProviderConfiguration extends BaseError {
  constructor(message: string) {
    super(Errors.InvalidProviderConfiguration, message);
  }
}

export class NoSuchSolutionProvider extends BaseError {
  constructor(message: string) {
    super(Errors.NoSuchSolutionProvider, message);
  }
}

export class SolutionProviderNotApproved extends BaseError {
  constructor(message: string) {
    super(Errors.SolutionProviderNotApproved, message);
  }
}

export class TwinNotAuthorized extends BaseError {
  constructor(message: string) {
    super(Errors.TwinNotAuthorized, message);
  }
}

export class ServiceContractNotExists extends BaseError {
  constructor(message: string) {
    super(Errors.ServiceContractNotExists, message);
  }
}

export class ServiceContractCreationNotAllowed extends BaseError {
  constructor(message: string) {
    super(Errors.ServiceContractCreationNotAllowed, message);
  }
}

export class ServiceContractModificationNotAllowed extends BaseError {
  constructor(message: string) {
    super(Errors.ServiceContractModificationNotAllowed, message);
  }
}

export class ServiceContractApprovalNotAllowed extends BaseError {
  constructor(message: string) {
    super(Errors.ServiceContractApprovalNotAllowed, message);
  }
}

export class ServiceContractRejectionNotAllowed extends BaseError {
  constructor(message: string) {
    super(Errors.ServiceContractRejectionNotAllowed, message);
  }
}

export class ServiceContractBillingNotApprovedByBoth extends BaseError {
  constructor(message: string) {
    super(Errors.ServiceContractBillingNotApprovedByBoth, message);
  }
}

export class ServiceContractBillingVariableAmountTooHigh extends BaseError {
  constructor(message: string) {
    super(Errors.ServiceContractBillingVariableAmountTooHigh, message);
  }
}

export class ServiceContractBillMetadataTooLong extends BaseError {
  constructor(message: string) {
    super(Errors.ServiceContractBillMetadataTooLong, message);
  }
}

export class ServiceContractMetadataTooLong extends BaseError {
  constructor(message: string) {
    super(Errors.ServiceContractMetadataTooLong, message);
  }
}

export class ServiceContractNotEnoughFundsToPayBill extends BaseError {
  constructor(message: string) {
    super(Errors.ServiceContractNotEnoughFundsToPayBill, message);
  }
}

export class CanOnlyIncreaseFrequency extends BaseError {
  constructor(message: string) {
    super(Errors.CanOnlyIncreaseFrequency, message);
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

export class UnauthorizedToChangeSolutionProviderId extends BaseError {
  constructor(message: string) {
    super(Errors.UnauthorizedToChangeSolutionProviderId, message);
  }
}

export class UnauthorizedToSetExtraFee extends BaseError {
  constructor(message: string) {
    super(Errors.UnauthorizedToSetExtraFee, message);
  }
}
