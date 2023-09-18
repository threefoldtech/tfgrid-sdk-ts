import { assertBoolean, assertId, assertIn, assertNatural, assertPattern, assertString } from "../utils";
import { AbstractBuilder, BuilderMapper, BuilderMethods, BuilderValidator } from "./abstract_builder";
import { ID_PATTERN, NodeStatus } from "./gateways";

export interface NodesQuery {
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
  domain: boolean;
  ipv4: boolean;
  ipv6: boolean;
  dedicated: boolean;
  rentable: boolean;
  rented: boolean;
  rentedBy: number;
  availableFor: number;
  farmIds: string;
  nodeId: number;
}

const NODES_MAPPER: BuilderMapper<NodesQuery> = {
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
  domain: "domain",
  ipv4: "ipv4",
  ipv6: "ipv6",
  dedicated: "dedicated",
  rentable: "rentable",
  rented: "rented",
  rentedBy: "rented_by",
  availableFor: "available_for",
  farmIds: "farm_ids",
  nodeId: "node_id",
};

const NODES_VALIDATOR: BuilderValidator<NodesQuery> = {
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
  domain: assertBoolean,
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
  nodeId: assertId,
};

export class NodesBuilder extends AbstractBuilder<NodesQuery> {
  constructor(public uri: string, queries: Partial<NodesQuery> = {}) {
    super({
      mapper: NODES_MAPPER,
      validator: NODES_VALIDATOR,
      queries,
    });
  }
}

export interface NodesBuilder extends BuilderMethods<NodesQuery, NodesBuilder> {}
