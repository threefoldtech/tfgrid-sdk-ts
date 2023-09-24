import { assertBoolean, assertId, assertIn, assertNatural, assertString } from "../utils";
import { AbstractBuilder, BuilderMapper, BuilderMethods, BuilderValidator } from "./abstract_builder";

export enum CertificationType {
  Diy = "DIY",
  Certified = "Certified",
  NotCertified = "NotCertified",
}

export interface FarmsQuery {
  page: number;
  size: number;
  retCount: boolean;
  freeIps: number;
  totalIps: number;
  pricingPolicyId: number;
  version: number;
  farmId: number;
  twinId: number;
  name: string;
  nameContains: string;
  certificationType: CertificationType;
  dedicated: boolean;
  stellarAddress: string;
}

const FARMS_MAPPER: BuilderMapper<FarmsQuery> = {
  page: "page",
  size: "size",
  retCount: "ret_count",
  freeIps: "free_ips",
  certificationType: "certification_type",
  version: "version",
  dedicated: "dedicated",
  farmId: "farm_id",
  name: "name",
  nameContains: "name_contains",
  pricingPolicyId: "pricing_policy_id",
  stellarAddress: "stellar_address",
  totalIps: "total_ips",
  twinId: "twin_id",
};

const FARMS_VALIDATOR: BuilderValidator<FarmsQuery> = {
  page: assertNatural,
  size: assertNatural,
  retCount: assertBoolean,
  freeIps: assertNatural,
  totalIps: assertNatural,
  pricingPolicyId: assertId,
  version: assertNatural,
  farmId: assertId,
  twinId: assertId,
  name: assertString,
  nameContains: assertString,
  certificationType(value) {
    assertIn(value, [CertificationType.Diy, CertificationType.Certified]);
  },
  dedicated: assertBoolean,
  stellarAddress: assertString,
};

export class FarmsBuilder extends AbstractBuilder<FarmsQuery> {
  constructor(public uri: string, queries: Partial<FarmsQuery> = {}) {
    super({
      mapper: FARMS_MAPPER,
      validator: FARMS_VALIDATOR,
      queries,
    });
  }
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FarmsBuilder extends BuilderMethods<FarmsQuery, FarmsBuilder> {}
