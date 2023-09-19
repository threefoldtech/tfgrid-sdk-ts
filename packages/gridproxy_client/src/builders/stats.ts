import { assertIn } from "../utils";
import { AbstractBuilder, BuilderMapper, BuilderMethods, BuilderValidator } from "./abstract_builder";
import { NodeStatus } from "./gateways";

export interface StatsQuery {
  status: NodeStatus;
}

const STATS_MAPPER: BuilderMapper<StatsQuery> = {
  status: "status",
};

const STATS_VALIDATOR: BuilderValidator<StatsQuery> = {
  status(value) {
    assertIn(value, [NodeStatus.Up, NodeStatus.Down]);
  },
};

export class StatsBuilder extends AbstractBuilder<StatsQuery> {
  constructor(public uri: string, queries: Partial<StatsQuery> = {}) {
    super({
      mapper: STATS_MAPPER,
      validator: STATS_VALIDATOR,
      queries,
    });
  }
}

export interface StatuBuilder extends BuilderMethods<StatsQuery, StatuBuilder> {}
