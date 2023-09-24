import { assertBoolean, assertId, assertIn, assertNatural, assertPattern, assertString } from "../utils";
import { AbstractBuilder, BuilderMapper, BuilderMethods, BuilderValidator } from "./abstract_builder";

export enum NodeStatus {
  Up = "up",
  Down = "down",
  Standby = "standby",
}

export interface GatewaysQuery {
  page: number;
  size: number;
  retCount: boolean;
  freeMru: number;
  freeHru: number;
  freeSru: number;
  freeIps: number;
  status: NodeStatus;
  city: string;
  country: string;
  farmName: string;
  ipv4: boolean;
  ipv6: boolean;
  dedicated: boolean;
  rentable: boolean;
  rented: boolean;
  rentedBy: number;
  availableFor: number;
  farmIds: string;
}

const GATEWAYS_MAPPER: BuilderMapper<GatewaysQuery> = {
  page: "page",
  size: "size",
  retCount: "ret_count",
  freeMru: "free_mru",
  freeHru: "free_hru",
  freeSru: "free_sru",
  freeIps: "free_ips",
  status: "status",
  city: "city",
  country: "country",
  farmName: "farm_name",
  ipv4: "ipv4",
  ipv6: "ipv6",
  dedicated: "dedicated",
  rentable: "rentable",
  rented: "rented",
  rentedBy: "rentedBy",
  availableFor: "available_for",
  farmIds: "farm_ids",
};

export const ID_PATTERN = /^\d+$/;
const GATEWAYS_VALIDATOR: BuilderValidator<GatewaysQuery> = {
  page: assertNatural,
  size: assertNatural,
  retCount: assertBoolean,
  freeMru: assertNatural,
  freeHru: assertNatural,
  freeSru: assertNatural,
  freeIps: assertNatural,
  status(value) {
    assertIn(value, [NodeStatus.Up, NodeStatus.Down]);
  },
  city: assertString,
  country: assertString,
  farmName: assertString,
  ipv4: assertBoolean,
  ipv6: assertBoolean,
  dedicated: assertBoolean,
  rentable: assertBoolean,
  rented: assertBoolean,
  rentedBy: assertId,
  availableFor: assertId,
  farmIds(value) {
    value.split(",").forEach(id => {
      assertPattern(id, ID_PATTERN);
      assertId(+id);
    });
  },
};

export class GatewayBuilder extends AbstractBuilder<GatewaysQuery> {
  constructor(public uri: string, queries: Partial<GatewaysQuery> = {}) {
    super({
      mapper: GATEWAYS_MAPPER,
      validator: GATEWAYS_VALIDATOR,
      queries,
    });
  }
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GatewayBuilder extends BuilderMethods<GatewaysQuery, GatewayBuilder> {}
