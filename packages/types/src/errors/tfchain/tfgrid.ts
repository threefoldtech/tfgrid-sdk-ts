import { BaseError } from "../base_error";
import { ErrorModules } from "../modules";

export enum Errors {
  NoneValue,
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
  constructor(name: string, code: number, message: string) {
    super(name, code, message, ErrorModules.TFGrid);
  }
}
export class NoneValue extends TFGridErrors {
  constructor(message: string) {
    super("NoneValue", Errors.NoneValue, message);
  }
}

export class StorageOverflow extends TFGridErrors {
  constructor(message: string) {
    super("StorageOverflow", Errors.StorageOverflow, message);
  }
}

export class CannotCreateNode extends TFGridErrors {
  constructor(message: string) {
    super("CannotCreateNode", Errors.CannotCreateNode, message);
  }
}

export class NodeNotExists extends TFGridErrors {
  constructor(message: string) {
    super("NodeNotExists", Errors.NodeNotExists, message);
  }
}

export class NodeWithTwinIdExists extends TFGridErrors {
  constructor(message: string) {
    super("NodeWithTwinIdExists", Errors.NodeWithTwinIdExists, message);
  }
}

export class CannotDeleteNode extends TFGridErrors {
  constructor(message: string) {
    super("CannotDeleteNode", Errors.CannotDeleteNode, message);
  }
}

export class NodeDeleteNotAuthorized extends TFGridErrors {
  constructor(message: string) {
    super("NodeDeleteNotAuthorized", Errors.NodeDeleteNotAuthorized, message);
  }
}

export class NodeUpdateNotAuthorized extends TFGridErrors {
  constructor(message: string) {
    super("NodeUpdateNotAuthorized", Errors.NodeUpdateNotAuthorized, message);
  }
}

export class FarmExists extends TFGridErrors {
  constructor(message: string) {
    super("FarmExists", Errors.FarmExists, message);
  }
}

export class FarmNotExists extends TFGridErrors {
  constructor(message: string) {
    super("FarmNotExists", Errors.FarmNotExists, message);
  }
}

export class CannotCreateFarmWrongTwin extends TFGridErrors {
  constructor(message: string) {
    super("CannotCreateFarmWrongTwin", Errors.CannotCreateFarmWrongTwin, message);
  }
}

export class CannotUpdateFarmWrongTwin extends TFGridErrors {
  constructor(message: string) {
    super("CannotUpdateFarmWrongTwin", Errors.CannotUpdateFarmWrongTwin, message);
  }
}

export class CannotDeleteFarm extends TFGridErrors {
  constructor(message: string) {
    super("CannotDeleteFarm", Errors.CannotDeleteFarm, message);
  }
}

export class CannotDeleteFarmWithPublicIPs extends TFGridErrors {
  constructor(message: string) {
    super("CannotDeleteFarmWithPublicIPs", Errors.CannotDeleteFarmWithPublicIPs, message);
  }
}

export class CannotDeleteFarmWithNodesAssigned extends TFGridErrors {
  constructor(message: string) {
    super("CannotDeleteFarmWithNodesAssigned", Errors.CannotDeleteFarmWithNodesAssigned, message);
  }
}

export class CannotDeleteFarmWrongTwin extends TFGridErrors {
  constructor(message: string) {
    super("CannotDeleteFarmWrongTwin", Errors.CannotDeleteFarmWrongTwin, message);
  }
}

export class IpExists extends TFGridErrors {
  constructor(message: string) {
    super("IpExists", Errors.IpExists, message);
  }
}

export class IpNotExists extends TFGridErrors {
  constructor(message: string) {
    super("IpNotExists", Errors.IpNotExists, message);
  }
}

export class EntityWithNameExists extends TFGridErrors {
  constructor(message: string) {
    super("EntityWithNameExists", Errors.EntityWithNameExists, message);
  }
}

export class EntityWithPubkeyExists extends TFGridErrors {
  constructor(message: string) {
    super("EntityWithPubkeyExists", Errors.EntityWithPubkeyExists, message);
  }
}

export class EntityNotExists extends TFGridErrors {
  constructor(message: string) {
    super("EntityNotExists", Errors.EntityNotExists, message);
  }
}

export class EntitySignatureDoesNotMatch extends TFGridErrors {
  constructor(message: string) {
    super("EntitySignatureDoesNotMatch", Errors.EntitySignatureDoesNotMatch, message);
  }
}

export class EntityWithSignatureAlreadyExists extends TFGridErrors {
  constructor(message: string) {
    super("EntityWithSignatureAlreadyExists", Errors.EntityWithSignatureAlreadyExists, message);
  }
}

export class CannotUpdateEntity extends TFGridErrors {
  constructor(message: string) {
    super("CannotUpdateEntity", Errors.CannotUpdateEntity, message);
  }
}

export class CannotDeleteEntity extends TFGridErrors {
  constructor(message: string) {
    super("CannotDeleteEntity", Errors.CannotDeleteEntity, message);
  }
}

export class SignatureLengthIsIncorrect extends TFGridErrors {
  constructor(message: string) {
    super("SignatureLengthIsIncorrect", Errors.SignatureLengthIsIncorrect, message);
  }
}

export class TwinExists extends TFGridErrors {
  constructor(message: string) {
    super("TwinExists", Errors.TwinExists, message);
  }
}

export class TwinNotExists extends TFGridErrors {
  constructor(message: string) {
    super("TwinNotExists", Errors.TwinNotExists, message);
  }
}

export class TwinWithPubkeyExists extends TFGridErrors {
  constructor(message: string) {
    super("TwinWithPubkeyExists", Errors.TwinWithPubkeyExists, message);
  }
}

export class CannotCreateTwin extends TFGridErrors {
  constructor(message: string) {
    super("CannotCreateTwin", Errors.CannotCreateTwin, message);
  }
}

export class UnauthorizedToUpdateTwin extends TFGridErrors {
  constructor(message: string) {
    super("UnauthorizedToUpdateTwin", Errors.UnauthorizedToUpdateTwin, message);
  }
}

export class TwinCannotBoundToItself extends TFGridErrors {
  constructor(message: string) {
    super("TwinCannotBoundToItself", Errors.TwinCannotBoundToItself, message);
  }
}

export class PricingPolicyExists extends TFGridErrors {
  constructor(message: string) {
    super("PricingPolicyExists", Errors.PricingPolicyExists, message);
  }
}

export class PricingPolicyNotExists extends TFGridErrors {
  constructor(message: string) {
    super("PricingPolicyNotExists", Errors.PricingPolicyNotExists, message);
  }
}

export class PricingPolicyWithDifferentIdExists extends TFGridErrors {
  constructor(message: string) {
    super("PricingPolicyWithDifferentIdExists", Errors.PricingPolicyWithDifferentIdExists, message);
  }
}

export class CertificationCodeExists extends TFGridErrors {
  constructor(message: string) {
    super("CertificationCodeExists", Errors.CertificationCodeExists, message);
  }
}

export class FarmingPolicyAlreadyExists extends TFGridErrors {
  constructor(message: string) {
    super("FarmingPolicyAlreadyExists", Errors.FarmingPolicyAlreadyExists, message);
  }
}

export class FarmPayoutAdressAlreadyRegistered extends TFGridErrors {
  constructor(message: string) {
    super("FarmPayoutAdressAlreadyRegistered", Errors.FarmPayoutAdressAlreadyRegistered, message);
  }
}

export class FarmerDoesNotHaveEnoughFunds extends TFGridErrors {
  constructor(message: string) {
    super("FarmerDoesNotHaveEnoughFunds", Errors.FarmerDoesNotHaveEnoughFunds, message);
  }
}

export class UserDidNotSignTermsAndConditions extends TFGridErrors {
  constructor(message: string) {
    super("UserDidNotSignTermsAndConditions", Errors.UserDidNotSignTermsAndConditions, message);
  }
}

export class FarmerDidNotSignTermsAndConditions extends TFGridErrors {
  constructor(message: string) {
    super("FarmerDidNotSignTermsAndConditions", Errors.FarmerDidNotSignTermsAndConditions, message);
  }
}

export class FarmerNotAuthorized extends TFGridErrors {
  constructor(message: string) {
    super("FarmerNotAuthorized", Errors.FarmerNotAuthorized, message);
  }
}

export class InvalidFarmName extends TFGridErrors {
  constructor(message: string) {
    super("InvalidFarmName", Errors.InvalidFarmName, message);
  }
}

export class AlreadyCertifier extends TFGridErrors {
  constructor(message: string) {
    super("AlreadyCertifier", Errors.AlreadyCertifier, message);
  }
}

export class NotCertifier extends TFGridErrors {
  constructor(message: string) {
    super("NotCertifier", Errors.NotCertifier, message);
  }
}

export class NotAllowedToCertifyNode extends TFGridErrors {
  constructor(message: string) {
    super("NotAllowedToCertifyNode", Errors.NotAllowedToCertifyNode, message);
  }
}

export class FarmingPolicyNotExists extends TFGridErrors {
  constructor(message: string) {
    super("FarmingPolicyNotExists", Errors.FarmingPolicyNotExists, message);
  }
}

export class RelayTooShort extends TFGridErrors {
  constructor(message: string) {
    super("RelayTooShort", Errors.RelayTooShort, message);
  }
}

export class RelayTooLong extends TFGridErrors {
  constructor(message: string) {
    super("RelayTooLong", Errors.RelayTooLong, message);
  }
}

export class InvalidRelay extends TFGridErrors {
  constructor(message: string) {
    super("InvalidRelay", Errors.InvalidRelay, message);
  }
}

export class FarmNameTooShort extends TFGridErrors {
  constructor(message: string) {
    super("FarmNameTooShort", Errors.FarmNameTooShort, message);
  }
}

export class FarmNameTooLong extends TFGridErrors {
  constructor(message: string) {
    super("FarmNameTooLong", Errors.FarmNameTooLong, message);
  }
}

export class InvalidPublicIP extends TFGridErrors {
  constructor(message: string) {
    super("InvalidPublicIP", Errors.InvalidPublicIP, message);
  }
}

export class PublicIPTooShort extends TFGridErrors {
  constructor(message: string) {
    super("PublicIPTooShort", Errors.PublicIPTooShort, message);
  }
}

export class PublicIPTooLong extends TFGridErrors {
  constructor(message: string) {
    super("PublicIPTooLong", Errors.PublicIPTooLong, message);
  }
}

export class GatewayIPTooShort extends TFGridErrors {
  constructor(message: string) {
    super("GatewayIPTooShort", Errors.GatewayIPTooShort, message);
  }
}

export class GatewayIPTooLong extends TFGridErrors {
  constructor(message: string) {
    super("GatewayIPTooLong", Errors.GatewayIPTooLong, message);
  }
}

export class IP4TooShort extends TFGridErrors {
  constructor(message: string) {
    super("IP4TooShort", Errors.IP4TooShort, message);
  }
}

export class IP4TooLong extends TFGridErrors {
  constructor(message: string) {
    super("IP4TooLong", Errors.IP4TooLong, message);
  }
}

export class InvalidIP4 extends TFGridErrors {
  constructor(message: string) {
    super("InvalidIP4", Errors.InvalidIP4, message);
  }
}

export class GW4TooShort extends TFGridErrors {
  constructor(message: string) {
    super("GW4TooShort", Errors.GW4TooShort, message);
  }
}

export class GW4TooLong extends TFGridErrors {
  constructor(message: string) {
    super("GW4TooLong", Errors.GW4TooLong, message);
  }
}

export class InvalidGW4 extends TFGridErrors {
  constructor(message: string) {
    super("InvalidGW4", Errors.InvalidGW4, message);
  }
}

export class IP6TooShort extends TFGridErrors {
  constructor(message: string) {
    super("IP6TooShort", Errors.IP6TooShort, message);
  }
}

export class IP6TooLong extends TFGridErrors {
  constructor(message: string) {
    super("IP6TooLong", Errors.IP6TooLong, message);
  }
}

export class InvalidIP6 extends TFGridErrors {
  constructor(message: string) {
    super("InvalidIP6", Errors.InvalidIP6, message);
  }
}

export class GW6TooShort extends TFGridErrors {
  constructor(message: string) {
    super("GW6TooShort", Errors.GW6TooShort, message);
  }
}

export class GW6TooLong extends TFGridErrors {
  constructor(message: string) {
    super("GW6TooLong", Errors.GW6TooLong, message);
  }
}

export class InvalidGW6 extends TFGridErrors {
  constructor(message: string) {
    super("InvalidGW6", Errors.InvalidGW6, message);
  }
}

export class DomainTooShort extends TFGridErrors {
  constructor(message: string) {
    super("DomainTooShort", Errors.DomainTooShort, message);
  }
}

export class DomainTooLong extends TFGridErrors {
  constructor(message: string) {
    super("DomainTooLong", Errors.DomainTooLong, message);
  }
}

export class InvalidDomain extends TFGridErrors {
  constructor(message: string) {
    super("InvalidDomain", Errors.InvalidDomain, message);
  }
}

export class MethodIsDeprecated extends TFGridErrors {
  constructor(message: string) {
    super("MethodIsDeprecated", Errors.MethodIsDeprecated, message);
  }
}

export class InterfaceNameTooShort extends TFGridErrors {
  constructor(message: string) {
    super("InterfaceNameTooShort", Errors.InterfaceNameTooShort, message);
  }
}

export class InterfaceNameTooLong extends TFGridErrors {
  constructor(message: string) {
    super("InterfaceNameTooLong", Errors.InterfaceNameTooLong, message);
  }
}

export class InvalidInterfaceName extends TFGridErrors {
  constructor(message: string) {
    super("InvalidInterfaceName", Errors.InvalidInterfaceName, message);
  }
}

export class InterfaceMacTooShort extends TFGridErrors {
  constructor(message: string) {
    super("InterfaceMacTooShort", Errors.InterfaceMacTooShort, message);
  }
}

export class InterfaceMacTooLong extends TFGridErrors {
  constructor(message: string) {
    super("InterfaceMacTooLong", Errors.InterfaceMacTooLong, message);
  }
}

export class InvalidMacAddress extends TFGridErrors {
  constructor(message: string) {
    super("InvalidMacAddress", Errors.InvalidMacAddress, message);
  }
}

export class InterfaceIpTooShort extends TFGridErrors {
  constructor(message: string) {
    super("InterfaceIpTooShort", Errors.InterfaceIpTooShort, message);
  }
}

export class InterfaceIpTooLong extends TFGridErrors {
  constructor(message: string) {
    super("InterfaceIpTooLong", Errors.InterfaceIpTooLong, message);
  }
}

export class InvalidInterfaceIP extends TFGridErrors {
  constructor(message: string) {
    super("InvalidInterfaceIP", Errors.InvalidInterfaceIP, message);
  }
}

export class InvalidZosVersion extends TFGridErrors {
  constructor(message: string) {
    super("InvalidZosVersion", Errors.InvalidZosVersion, message);
  }
}

export class FarmingPolicyExpired extends TFGridErrors {
  constructor(message: string) {
    super("FarmingPolicyExpired", Errors.FarmingPolicyExpired, message);
  }
}

export class InvalidHRUInput extends TFGridErrors {
  constructor(message: string) {
    super("InvalidHRUInput", Errors.InvalidHRUInput, message);
  }
}

export class InvalidSRUInput extends TFGridErrors {
  constructor(message: string) {
    super("InvalidSRUInput", Errors.InvalidSRUInput, message);
  }
}

export class InvalidCRUInput extends TFGridErrors {
  constructor(message: string) {
    super("InvalidCRUInput", Errors.InvalidCRUInput, message);
  }
}

export class InvalidMRUInput extends TFGridErrors {
  constructor(message: string) {
    super("InvalidMRUInput", Errors.InvalidMRUInput, message);
  }
}

export class LatitudeInputTooShort extends TFGridErrors {
  constructor(message: string) {
    super("LatitudeInputTooShort", Errors.LatitudeInputTooShort, message);
  }
}

export class LatitudeInputTooLong extends TFGridErrors {
  constructor(message: string) {
    super("LatitudeInputTooLong", Errors.LatitudeInputTooLong, message);
  }
}

export class InvalidLatitudeInput extends TFGridErrors {
  constructor(message: string) {
    super("InvalidLatitudeInput", Errors.InvalidLatitudeInput, message);
  }
}

export class LongitudeInputTooShort extends TFGridErrors {
  constructor(message: string) {
    super("LongitudeInputTooShort", Errors.LongitudeInputTooShort, message);
  }
}

export class LongitudeInputTooLong extends TFGridErrors {
  constructor(message: string) {
    super("LongitudeInputTooLong", Errors.LongitudeInputTooLong, message);
  }
}

export class InvalidLongitudeInput extends TFGridErrors {
  constructor(message: string) {
    super("InvalidLongitudeInput", Errors.InvalidLongitudeInput, message);
  }
}

export class CountryNameTooShort extends TFGridErrors {
  constructor(message: string) {
    super("CountryNameTooShort", Errors.CountryNameTooShort, message);
  }
}

export class CountryNameTooLong extends TFGridErrors {
  constructor(message: string) {
    super("CountryNameTooLong", Errors.CountryNameTooLong, message);
  }
}

export class InvalidCountryName extends TFGridErrors {
  constructor(message: string) {
    super("InvalidCountryName", Errors.InvalidCountryName, message);
  }
}

export class CityNameTooShort extends TFGridErrors {
  constructor(message: string) {
    super("CityNameTooShort", Errors.CityNameTooShort, message);
  }
}

export class CityNameTooLong extends TFGridErrors {
  constructor(message: string) {
    super("CityNameTooLong", Errors.CityNameTooLong, message);
  }
}

export class InvalidCityName extends TFGridErrors {
  constructor(message: string) {
    super("InvalidCityName", Errors.InvalidCityName, message);
  }
}

export class InvalidCountryCityPair extends TFGridErrors {
  constructor(message: string) {
    super("InvalidCountryCityPair", Errors.InvalidCountryCityPair, message);
  }
}

export class SerialNumberTooShort extends TFGridErrors {
  constructor(message: string) {
    super("SerialNumberTooShort", Errors.SerialNumberTooShort, message);
  }
}

export class SerialNumberTooLong extends TFGridErrors {
  constructor(message: string) {
    super("SerialNumberTooLong", Errors.SerialNumberTooLong, message);
  }
}

export class InvalidSerialNumber extends TFGridErrors {
  constructor(message: string) {
    super("InvalidSerialNumber", Errors.InvalidSerialNumber, message);
  }
}

export class DocumentLinkInputTooShort extends TFGridErrors {
  constructor(message: string) {
    super("DocumentLinkInputTooShort", Errors.DocumentLinkInputTooShort, message);
  }
}

export class DocumentLinkInputTooLong extends TFGridErrors {
  constructor(message: string) {
    super("DocumentLinkInputTooLong", Errors.DocumentLinkInputTooLong, message);
  }
}

export class InvalidDocumentLinkInput extends TFGridErrors {
  constructor(message: string) {
    super("InvalidDocumentLinkInput", Errors.InvalidDocumentLinkInput, message);
  }
}

export class DocumentHashInputTooShort extends TFGridErrors {
  constructor(message: string) {
    super("DocumentHashInputTooShort", Errors.DocumentHashInputTooShort, message);
  }
}

export class DocumentHashInputTooLong extends TFGridErrors {
  constructor(message: string) {
    super("DocumentHashInputTooLong", Errors.DocumentHashInputTooLong, message);
  }
}

export class InvalidDocumentHashInput extends TFGridErrors {
  constructor(message: string) {
    super("InvalidDocumentHashInput", Errors.InvalidDocumentHashInput, message);
  }
}

export class InvalidPublicConfig extends TFGridErrors {
  constructor(message: string) {
    super("InvalidPublicConfig", Errors.InvalidPublicConfig, message);
  }
}

export class UnauthorizedToChangePowerTarget extends TFGridErrors {
  constructor(message: string) {
    super("UnauthorizedToChangePowerTarget", Errors.UnauthorizedToChangePowerTarget, message);
  }
}

export class InvalidRelayAddress extends TFGridErrors {
  constructor(message: string) {
    super("InvalidRelayAddress", Errors.InvalidRelayAddress, message);
  }
}

export class InvalidTimestampHint extends TFGridErrors {
  constructor(message: string) {
    super("InvalidTimestampHint", Errors.InvalidTimestampHint, message);
  }
}
