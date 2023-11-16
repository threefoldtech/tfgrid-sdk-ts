import { BaseError } from "../base_error";

export enum Errors {
  NoneValue = 1,
  StorageOverflow,

  CannotCreateNode,
  NodeNotExists,
  NodeWithTwinIdExists,
  CannotDeleteNode,
  NodeDeleteNotAuthorized,
  NodeUpdateNotAuthorized,

  FarmExists,
  FarmNotExists,
  CannotCreateFarmWrongTwin,
  CannotUpdateFarmWrongTwin,
  CannotDeleteFarm,
  CannotDeleteFarmWithPublicIPs,
  CannotDeleteFarmWithNodesAssigned,
  CannotDeleteFarmWrongTwin,
  IpExists,
  IpNotExists,

  EntityWithNameExists,
  EntityWithPubkeyExists,
  EntityNotExists,
  EntitySignatureDoesNotMatch,
  EntityWithSignatureAlreadyExists,
  CannotUpdateEntity,
  CannotDeleteEntity,
  SignatureLengthIsIncorrect,

  TwinExists,
  TwinNotExists,
  TwinWithPubkeyExists,
  CannotCreateTwin,
  UnauthorizedToUpdateTwin,
  TwinCannotBoundToItself,

  PricingPolicyExists,
  PricingPolicyNotExists,
  PricingPolicyWithDifferentIdExists,
  CertificationCodeExists,
  FarmingPolicyAlreadyExists,
  FarmPayoutAdressAlreadyRegistered,
  FarmerDoesNotHaveEnoughFunds,
  UserDidNotSignTermsAndConditions,
  FarmerDidNotSignTermsAndConditions,
  FarmerNotAuthorized,
  InvalidFarmName,

  AlreadyCertifier,
  NotCertifier,
  NotAllowedToCertifyNode,

  FarmingPolicyNotExists,

  RelayTooShort,
  RelayTooLong,
  InvalidRelay,

  FarmNameTooShort,
  FarmNameTooLong,
  InvalidPublicIP,
  PublicIPTooShort,
  PublicIPTooLong,
  GatewayIPTooShort,
  GatewayIPTooLong,

  IP4TooShort,
  IP4TooLong,
  InvalidIP4,
  GW4TooShort,
  GW4TooLong,
  InvalidGW4,
  IP6TooShort,
  IP6TooLong,
  InvalidIP6,
  GW6TooShort,
  GW6TooLong,
  InvalidGW6,
  DomainTooShort,
  DomainTooLong,
  InvalidDomain,
  MethodIsDeprecated,
  InterfaceNameTooShort,
  InterfaceNameTooLong,
  InvalidInterfaceName,
  InterfaceMacTooShort,
  InterfaceMacTooLong,
  InvalidMacAddress,
  InterfaceIpTooShort,
  InterfaceIpTooLong,
  InvalidInterfaceIP,
  InvalidZosVersion,
  FarmingPolicyExpired,

  InvalidHRUInput,
  InvalidSRUInput,
  InvalidCRUInput,
  InvalidMRUInput,

  LatitudeInputTooShort,
  LatitudeInputTooLong,
  InvalidLatitudeInput,
  LongitudeInputTooShort,
  LongitudeInputTooLong,
  InvalidLongitudeInput,
  CountryNameTooShort,
  CountryNameTooLong,
  InvalidCountryName,
  CityNameTooShort,
  CityNameTooLong,
  InvalidCityName,
  InvalidCountryCityPair,

  SerialNumberTooShort,
  SerialNumberTooLong,
  InvalidSerialNumber,

  DocumentLinkInputTooShort,
  DocumentLinkInputTooLong,
  InvalidDocumentLinkInput,
  DocumentHashInputTooShort,
  DocumentHashInputTooLong,
  InvalidDocumentHashInput,

  InvalidPublicConfig,
  UnauthorizedToChangePowerTarget,
  InvalidRelayAddress,
  InvalidTimestampHint,
}

class TFGridErrors extends BaseError {
  constructor(code: number, message: string) {
    super(code, message, "tfgridModule");
  }
}
export class NoneValue extends TFGridErrors {
  constructor(message: string) {
    super(Errors.NoneValue, message);
  }
}

export class StorageOverflow extends TFGridErrors {
  constructor(message: string) {
    super(Errors.StorageOverflow, message);
  }
}

export class CannotCreateNode extends TFGridErrors {
  constructor(message: string) {
    super(Errors.CannotCreateNode, message);
  }
}

export class NodeNotExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.NodeNotExists, message);
  }
}

export class NodeWithTwinIdExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.NodeWithTwinIdExists, message);
  }
}

export class CannotDeleteNode extends TFGridErrors {
  constructor(message: string) {
    super(Errors.CannotDeleteNode, message);
  }
}

export class NodeDeleteNotAuthorized extends TFGridErrors {
  constructor(message: string) {
    super(Errors.NodeDeleteNotAuthorized, message);
  }
}

export class NodeUpdateNotAuthorized extends TFGridErrors {
  constructor(message: string) {
    super(Errors.NodeUpdateNotAuthorized, message);
  }
}

export class FarmExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.FarmExists, message);
  }
}

export class FarmNotExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.FarmNotExists, message);
  }
}

export class CannotCreateFarmWrongTwin extends TFGridErrors {
  constructor(message: string) {
    super(Errors.CannotCreateFarmWrongTwin, message);
  }
}

export class CannotUpdateFarmWrongTwin extends TFGridErrors {
  constructor(message: string) {
    super(Errors.CannotUpdateFarmWrongTwin, message);
  }
}

export class CannotDeleteFarm extends TFGridErrors {
  constructor(message: string) {
    super(Errors.CannotDeleteFarm, message);
  }
}

export class CannotDeleteFarmWithPublicIPs extends TFGridErrors {
  constructor(message: string) {
    super(Errors.CannotDeleteFarmWithPublicIPs, message);
  }
}

export class CannotDeleteFarmWithNodesAssigned extends TFGridErrors {
  constructor(message: string) {
    super(Errors.CannotDeleteFarmWithNodesAssigned, message);
  }
}

export class CannotDeleteFarmWrongTwin extends TFGridErrors {
  constructor(message: string) {
    super(Errors.CannotDeleteFarmWrongTwin, message);
  }
}

export class IpExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.IpExists, message);
  }
}

export class IpNotExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.IpNotExists, message);
  }
}

export class EntityWithNameExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.EntityWithNameExists, message);
  }
}

export class EntityWithPubkeyExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.EntityWithPubkeyExists, message);
  }
}

export class EntityNotExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.EntityNotExists, message);
  }
}

export class EntitySignatureDoesNotMatch extends TFGridErrors {
  constructor(message: string) {
    super(Errors.EntitySignatureDoesNotMatch, message);
  }
}

export class EntityWithSignatureAlreadyExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.EntityWithSignatureAlreadyExists, message);
  }
}

export class CannotUpdateEntity extends TFGridErrors {
  constructor(message: string) {
    super(Errors.CannotUpdateEntity, message);
  }
}

export class CannotDeleteEntity extends TFGridErrors {
  constructor(message: string) {
    super(Errors.CannotDeleteEntity, message);
  }
}

export class SignatureLengthIsIncorrect extends TFGridErrors {
  constructor(message: string) {
    super(Errors.SignatureLengthIsIncorrect, message);
  }
}

export class TwinExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.TwinExists, message);
  }
}

export class TwinNotExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.TwinNotExists, message);
  }
}

export class TwinWithPubkeyExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.TwinWithPubkeyExists, message);
  }
}

export class CannotCreateTwin extends TFGridErrors {
  constructor(message: string) {
    super(Errors.CannotCreateTwin, message);
  }
}

export class UnauthorizedToUpdateTwin extends TFGridErrors {
  constructor(message: string) {
    super(Errors.UnauthorizedToUpdateTwin, message);
  }
}

export class TwinCannotBoundToItself extends TFGridErrors {
  constructor(message: string) {
    super(Errors.TwinCannotBoundToItself, message);
  }
}

export class PricingPolicyExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.PricingPolicyExists, message);
  }
}

export class PricingPolicyNotExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.PricingPolicyNotExists, message);
  }
}

export class PricingPolicyWithDifferentIdExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.PricingPolicyWithDifferentIdExists, message);
  }
}

export class CertificationCodeExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.CertificationCodeExists, message);
  }
}

export class FarmingPolicyAlreadyExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.FarmingPolicyAlreadyExists, message);
  }
}

export class FarmPayoutAdressAlreadyRegistered extends TFGridErrors {
  constructor(message: string) {
    super(Errors.FarmPayoutAdressAlreadyRegistered, message);
  }
}

export class FarmerDoesNotHaveEnoughFunds extends TFGridErrors {
  constructor(message: string) {
    super(Errors.FarmerDoesNotHaveEnoughFunds, message);
  }
}

export class UserDidNotSignTermsAndConditions extends TFGridErrors {
  constructor(message: string) {
    super(Errors.UserDidNotSignTermsAndConditions, message);
  }
}

export class FarmerDidNotSignTermsAndConditions extends TFGridErrors {
  constructor(message: string) {
    super(Errors.FarmerDidNotSignTermsAndConditions, message);
  }
}

export class FarmerNotAuthorized extends TFGridErrors {
  constructor(message: string) {
    super(Errors.FarmerNotAuthorized, message);
  }
}

export class InvalidFarmName extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidFarmName, message);
  }
}

export class AlreadyCertifier extends TFGridErrors {
  constructor(message: string) {
    super(Errors.AlreadyCertifier, message);
  }
}

export class NotCertifier extends TFGridErrors {
  constructor(message: string) {
    super(Errors.NotCertifier, message);
  }
}

export class NotAllowedToCertifyNode extends TFGridErrors {
  constructor(message: string) {
    super(Errors.NotAllowedToCertifyNode, message);
  }
}

export class FarmingPolicyNotExists extends TFGridErrors {
  constructor(message: string) {
    super(Errors.FarmingPolicyNotExists, message);
  }
}

export class RelayTooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.RelayTooShort, message);
  }
}

export class RelayTooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.RelayTooLong, message);
  }
}

export class InvalidRelay extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidRelay, message);
  }
}

export class FarmNameTooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.FarmNameTooShort, message);
  }
}

export class FarmNameTooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.FarmNameTooLong, message);
  }
}

export class InvalidPublicIP extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidPublicIP, message);
  }
}

export class PublicIPTooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.PublicIPTooShort, message);
  }
}

export class PublicIPTooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.PublicIPTooLong, message);
  }
}

export class GatewayIPTooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.GatewayIPTooShort, message);
  }
}

export class GatewayIPTooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.GatewayIPTooLong, message);
  }
}

export class IP4TooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.IP4TooShort, message);
  }
}

export class IP4TooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.IP4TooLong, message);
  }
}

export class InvalidIP4 extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidIP4, message);
  }
}

export class GW4TooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.GW4TooShort, message);
  }
}

export class GW4TooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.GW4TooLong, message);
  }
}

export class InvalidGW4 extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidGW4, message);
  }
}

export class IP6TooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.IP6TooShort, message);
  }
}

export class IP6TooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.IP6TooLong, message);
  }
}

export class InvalidIP6 extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidIP6, message);
  }
}

export class GW6TooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.GW6TooShort, message);
  }
}

export class GW6TooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.GW6TooLong, message);
  }
}

export class InvalidGW6 extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidGW6, message);
  }
}

export class DomainTooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.DomainTooShort, message);
  }
}

export class DomainTooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.DomainTooLong, message);
  }
}

export class InvalidDomain extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidDomain, message);
  }
}

export class MethodIsDeprecated extends TFGridErrors {
  constructor(message: string) {
    super(Errors.MethodIsDeprecated, message);
  }
}

export class InterfaceNameTooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InterfaceNameTooShort, message);
  }
}

export class InterfaceNameTooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InterfaceNameTooLong, message);
  }
}

export class InvalidInterfaceName extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidInterfaceName, message);
  }
}

export class InterfaceMacTooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InterfaceMacTooShort, message);
  }
}

export class InterfaceMacTooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InterfaceMacTooLong, message);
  }
}

export class InvalidMacAddress extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidMacAddress, message);
  }
}

export class InterfaceIpTooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InterfaceIpTooShort, message);
  }
}

export class InterfaceIpTooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InterfaceIpTooLong, message);
  }
}

export class InvalidInterfaceIP extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidInterfaceIP, message);
  }
}

export class InvalidZosVersion extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidZosVersion, message);
  }
}

export class FarmingPolicyExpired extends TFGridErrors {
  constructor(message: string) {
    super(Errors.FarmingPolicyExpired, message);
  }
}

export class InvalidHRUInput extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidHRUInput, message);
  }
}

export class InvalidSRUInput extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidSRUInput, message);
  }
}

export class InvalidCRUInput extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidCRUInput, message);
  }
}

export class InvalidMRUInput extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidMRUInput, message);
  }
}

export class LatitudeInputTooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.LatitudeInputTooShort, message);
  }
}

export class LatitudeInputTooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.LatitudeInputTooLong, message);
  }
}

export class InvalidLatitudeInput extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidLatitudeInput, message);
  }
}

export class LongitudeInputTooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.LongitudeInputTooShort, message);
  }
}

export class LongitudeInputTooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.LongitudeInputTooLong, message);
  }
}

export class InvalidLongitudeInput extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidLongitudeInput, message);
  }
}

export class CountryNameTooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.CountryNameTooShort, message);
  }
}

export class CountryNameTooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.CountryNameTooLong, message);
  }
}

export class InvalidCountryName extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidCountryName, message);
  }
}

export class CityNameTooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.CityNameTooShort, message);
  }
}

export class CityNameTooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.CityNameTooLong, message);
  }
}

export class InvalidCityName extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidCityName, message);
  }
}

export class InvalidCountryCityPair extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidCountryCityPair, message);
  }
}

export class SerialNumberTooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.SerialNumberTooShort, message);
  }
}

export class SerialNumberTooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.SerialNumberTooLong, message);
  }
}

export class InvalidSerialNumber extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidSerialNumber, message);
  }
}

export class DocumentLinkInputTooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.DocumentLinkInputTooShort, message);
  }
}

export class DocumentLinkInputTooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.DocumentLinkInputTooLong, message);
  }
}

export class InvalidDocumentLinkInput extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidDocumentLinkInput, message);
  }
}

export class DocumentHashInputTooShort extends TFGridErrors {
  constructor(message: string) {
    super(Errors.DocumentHashInputTooShort, message);
  }
}

export class DocumentHashInputTooLong extends TFGridErrors {
  constructor(message: string) {
    super(Errors.DocumentHashInputTooLong, message);
  }
}

export class InvalidDocumentHashInput extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidDocumentHashInput, message);
  }
}

export class InvalidPublicConfig extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidPublicConfig, message);
  }
}

export class UnauthorizedToChangePowerTarget extends TFGridErrors {
  constructor(message: string) {
    super(Errors.UnauthorizedToChangePowerTarget, message);
  }
}

export class InvalidRelayAddress extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidRelayAddress, message);
  }
}

export class InvalidTimestampHint extends TFGridErrors {
  constructor(message: string) {
    super(Errors.InvalidTimestampHint, message);
  }
}
