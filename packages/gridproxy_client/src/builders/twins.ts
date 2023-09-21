import { assertBoolean, assertId, assertNatural } from "../utils";
import { AbstractBuilder, BuilderMapper, BuilderMethods, BuilderValidator } from "./abstract_builder";

export interface TwinsQuery {
  page: number;
  size: number;
  retCount: boolean;
  twinId: number;
  accountId: number;
}

const TWINS_MAPPER: BuilderMapper<TwinsQuery> = {
  page: "page",
  size: "size",
  retCount: "ret_count",
  accountId: "account_id",
  twinId: "twin_id",
};

const TWINS_VALIDATOR: BuilderValidator<TwinsQuery> = {
  page: assertNatural,
  size: assertNatural,
  retCount: assertBoolean,
  twinId: assertId,
  accountId: assertId,
};

export class TwinsBuilder extends AbstractBuilder<TwinsQuery> {
  constructor(public uri: string, queries: Partial<TwinsQuery> = {}) {
    super({
      mapper: TWINS_MAPPER,
      validator: TWINS_VALIDATOR,
      queries,
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TwinsBuilder extends BuilderMethods<TwinsQuery, TwinsBuilder> {}
