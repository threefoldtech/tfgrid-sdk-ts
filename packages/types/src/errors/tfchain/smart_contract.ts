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
  constructor(name: string, code: number, message: string) {
    super(name, code, message, ErrorModules.SmartContract);
  }
}
export class TwinNotExists extends SmartContractError {
  constructor(message: string) {
    super("TwinNotExists", Errors.TwinNotExists, message);
  }
}

export class NodeNotExists extends SmartContractError {
  constructor(message: string) {
    super("NodeNotExists", Errors.NodeNotExists, message);
  }
}

export class FarmNotExists extends SmartContractError {
  constructor(message: string) {
    super("FarmNotExists", Errors.FarmNotExists, message);
  }
}

export class FarmHasNotEnoughPublicIPs extends SmartContractError {
  constructor(message: string) {
    super("FarmHasNotEnoughPublicIPs", Errors.FarmHasNotEnoughPublicIPs, message);
  }
}

export class FarmHasNotEnoughPublicIPsFree extends SmartContractError {
  constructor(message: string) {
    super("FarmHasNotEnoughPublicIPsFree", Errors.FarmHasNotEnoughPublicIPsFree, message);
  }
}

export class FailedToReserveIP extends SmartContractError {
  constructor(message: string) {
    super("FailedToReserveIP", Errors.FailedToReserveIP, message);
  }
}

export class FailedToFreeIPs extends SmartContractError {
  constructor(message: string) {
    super("FailedToFreeIPs", Errors.FailedToFreeIPs, message);
  }
}

export class ContractNotExists extends SmartContractError {
  constructor(message: string) {
    super("ContractNotExists", Errors.ContractNotExists, message);
  }
}

export class TwinNotAuthorizedToUpdateContract extends SmartContractError {
  constructor(message: string) {
    super("TwinNotAuthorizedToUpdateContract", Errors.TwinNotAuthorizedToUpdateContract, message);
  }
}

export class TwinNotAuthorizedToCancelContract extends SmartContractError {
  constructor(message: string) {
    super("TwinNotAuthorizedToCancelContract", Errors.TwinNotAuthorizedToCancelContract, message);
  }
}

export class NodeNotAuthorizedToDeployContract extends SmartContractError {
  constructor(message: string) {
    super("NodeNotAuthorizedToDeployContract", Errors.NodeNotAuthorizedToDeployContract, message);
  }
}

export class NodeNotAuthorizedToComputeReport extends SmartContractError {
  constructor(message: string) {
    super("NodeNotAuthorizedToComputeReport", Errors.NodeNotAuthorizedToComputeReport, message);
  }
}

export class PricingPolicyNotExists extends SmartContractError {
  constructor(message: string) {
    super("PricingPolicyNotExists", Errors.PricingPolicyNotExists, message);
  }
}

export class ContractIsNotUnique extends SmartContractError {
  constructor(message: string) {
    super("ContractIsNotUnique", Errors.ContractIsNotUnique, message);
  }
}

export class ContractWrongBillingLoopIndex extends SmartContractError {
  constructor(message: string) {
    super("ContractWrongBillingLoopIndex", Errors.ContractWrongBillingLoopIndex, message);
  }
}

export class NameExists extends SmartContractError {
  constructor(message: string) {
    super("NameExists", Errors.NameExists, message);
  }
}

export class NameNotValid extends SmartContractError {
  constructor(message: string) {
    super("NameNotValid", Errors.NameNotValid, message);
  }
}

export class InvalidContractType extends SmartContractError {
  constructor(message: string) {
    super("InvalidContractType", Errors.InvalidContractType, message);
  }
}

export class TFTPriceValueError extends SmartContractError {
  constructor(message: string) {
    super("TFTPriceValueError", Errors.TFTPriceValueError, message);
  }
}

export class NotEnoughResourcesOnNode extends SmartContractError {
  constructor(message: string) {
    super("NotEnoughResourcesOnNode", Errors.NotEnoughResourcesOnNode, message);
  }
}

export class NodeNotAuthorizedToReportResources extends SmartContractError {
  constructor(message: string) {
    super("NodeNotAuthorizedToReportResources", Errors.NodeNotAuthorizedToReportResources, message);
  }
}

export class MethodIsDeprecated extends SmartContractError {
  constructor(message: string) {
    super("MethodIsDeprecated", Errors.MethodIsDeprecated, message);
  }
}

export class NodeHasActiveContracts extends SmartContractError {
  constructor(message: string) {
    super("NodeHasActiveContracts", Errors.NodeHasActiveContracts, message);
  }
}

export class NodeHasRentContract extends SmartContractError {
  constructor(message: string) {
    super("NodeHasRentContract", Errors.NodeHasRentContract, message);
  }
}

export class FarmIsNotDedicated extends SmartContractError {
  constructor(message: string) {
    super("FarmIsNotDedicated", Errors.FarmIsNotDedicated, message);
  }
}

export class NodeNotAvailableToDeploy extends SmartContractError {
  constructor(message: string) {
    super("NodeNotAvailableToDeploy", Errors.NodeNotAvailableToDeploy, message);
  }
}

export class CannotUpdateContractInGraceState extends SmartContractError {
  constructor(message: string) {
    super("CannotUpdateContractInGraceState", Errors.CannotUpdateContractInGraceState, message);
  }
}

export class NumOverflow extends SmartContractError {
  constructor(message: string) {
    super("NumOverflow", Errors.NumOverflow, message);
  }
}

export class OffchainSignedTxCannotSign extends SmartContractError {
  constructor(message: string) {
    super("OffchainSignedTxCannotSign", Errors.OffchainSignedTxCannotSign, message);
  }
}

export class OffchainSignedTxAlreadySent extends SmartContractError {
  constructor(message: string) {
    super("OffchainSignedTxAlreadySent", Errors.OffchainSignedTxAlreadySent, message);
  }
}

export class OffchainSignedTxNoLocalAccountAvailable extends SmartContractError {
  constructor(message: string) {
    super("OffchainSignedTxNoLocalAccountAvailable", Errors.OffchainSignedTxNoLocalAccountAvailable, message);
  }
}

export class NameContractNameTooShort extends SmartContractError {
  constructor(message: string) {
    super("NameContractNameTooShort", Errors.NameContractNameTooShort, message);
  }
}

export class NameContractNameTooLong extends SmartContractError {
  constructor(message: string) {
    super("NameContractNameTooLong", Errors.NameContractNameTooLong, message);
  }
}

export class InvalidProviderConfiguration extends SmartContractError {
  constructor(message: string) {
    super("InvalidProviderConfiguration", Errors.InvalidProviderConfiguration, message);
  }
}

export class NoSuchSolutionProvider extends SmartContractError {
  constructor(message: string) {
    super("NoSuchSolutionProvider", Errors.NoSuchSolutionProvider, message);
  }
}

export class SolutionProviderNotApproved extends SmartContractError {
  constructor(message: string) {
    super("SolutionProviderNotApproved", Errors.SolutionProviderNotApproved, message);
  }
}

export class TwinNotAuthorized extends SmartContractError {
  constructor(message: string) {
    super("TwinNotAuthorized", Errors.TwinNotAuthorized, message);
  }
}

export class ServiceContractNotExists extends SmartContractError {
  constructor(message: string) {
    super("ServiceContractNotExists", Errors.ServiceContractNotExists, message);
  }
}

export class ServiceContractCreationNotAllowed extends SmartContractError {
  constructor(message: string) {
    super("ServiceContractCreationNotAllowed", Errors.ServiceContractCreationNotAllowed, message);
  }
}

export class ServiceContractModificationNotAllowed extends SmartContractError {
  constructor(message: string) {
    super("ServiceContractModificationNotAllowed", Errors.ServiceContractModificationNotAllowed, message);
  }
}

export class ServiceContractApprovalNotAllowed extends SmartContractError {
  constructor(message: string) {
    super("ServiceContractApprovalNotAllowed", Errors.ServiceContractApprovalNotAllowed, message);
  }
}

export class ServiceContractRejectionNotAllowed extends SmartContractError {
  constructor(message: string) {
    super("ServiceContractRejectionNotAllowed", Errors.ServiceContractRejectionNotAllowed, message);
  }
}

export class ServiceContractBillingNotApprovedByBoth extends SmartContractError {
  constructor(message: string) {
    super("ServiceContractBillingNotApprovedByBoth", Errors.ServiceContractBillingNotApprovedByBoth, message);
  }
}

export class ServiceContractBillingVariableAmountTooHigh extends SmartContractError {
  constructor(message: string) {
    super("ServiceContractBillingVariableAmountTooHigh", Errors.ServiceContractBillingVariableAmountTooHigh, message);
  }
}

export class ServiceContractBillMetadataTooLong extends SmartContractError {
  constructor(message: string) {
    super("ServiceContractBillMetadataTooLong", Errors.ServiceContractBillMetadataTooLong, message);
  }
}

export class ServiceContractMetadataTooLong extends SmartContractError {
  constructor(message: string) {
    super("ServiceContractMetadataTooLong", Errors.ServiceContractMetadataTooLong, message);
  }
}

export class ServiceContractNotEnoughFundsToPayBill extends SmartContractError {
  constructor(message: string) {
    super("ServiceContractNotEnoughFundsToPayBill", Errors.ServiceContractNotEnoughFundsToPayBill, message);
  }
}

export class CanOnlyIncreaseFrequency extends SmartContractError {
  constructor(message: string) {
    super("CanOnlyIncreaseFrequency", Errors.CanOnlyIncreaseFrequency, message);
  }
}

export class IsNotAnAuthority extends SmartContractError {
  constructor(message: string) {
    super("IsNotAnAuthority", Errors.IsNotAnAuthority, message);
  }
}

export class WrongAuthority extends SmartContractError {
  constructor(message: string) {
    super("WrongAuthority", Errors.WrongAuthority, message);
  }
}

export class UnauthorizedToChangeSolutionProviderId extends SmartContractError {
  constructor(message: string) {
    super("UnauthorizedToChangeSolutionProviderId", Errors.UnauthorizedToChangeSolutionProviderId, message);
  }
}

export class UnauthorizedToSetExtraFee extends SmartContractError {
  constructor(message: string) {
    super("UnauthorizedToSetExtraFee", Errors.UnauthorizedToSetExtraFee, message);
  }
}
