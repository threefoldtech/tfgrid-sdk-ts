import { assertBoolean, assertId, assertNatural, assertString } from "../utils";
import { AbstractBuilder, BuilderMapper, BuilderValidator } from "./abstract_builder";
import { SortBy, SortOrder } from "./nodes";

export interface PublicIpQuery {
  page: number;
  size: number;
  retCount: boolean;
  randomize: boolean;
  sortBy: SortBy;
  sortOrder: SortOrder;
  farmIds: number;
  ip: string;
  gateway: string;
  free: boolean;
}

const PUBLICIPS_MAPPER: BuilderMapper<PublicIpQuery> = {
  page: "page",
  size: "size",
  retCount: "ret_count",
  randomize: "randomize",
  sortBy: "sort_by",
  sortOrder: "sort_order",
  farmIds: "farm_ids",
  ip: "ip",
  gateway: "gateway",
  free: "free",
};

const PUBLICIPS_VALIDATOR: BuilderValidator<PublicIpQuery> = {
  page: assertNatural,
  size: assertNatural,
  retCount: assertBoolean,
  randomize: assertBoolean,
  sortBy: assertString,
  sortOrder: assertString,
  farmIds: assertId,
  ip: assertString,
  gateway: assertString,
  free: assertBoolean,
};

export class PublicIpBuilder extends AbstractBuilder<PublicIpQuery> {
  constructor(
    public uri: string,
    queries: Partial<PublicIpQuery> = {},
  ) {
    super({
      mapper: PUBLICIPS_MAPPER,
      validator: PUBLICIPS_VALIDATOR,
      queries,
    });
  }
}
