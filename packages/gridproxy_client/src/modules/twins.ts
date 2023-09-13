import { resolvePaginator } from "../utils";
import { TwinsBuilder, TwinsQuery } from "../builders/twins";
import { AbstractClient } from "./abstract_client";

export interface Twin {
  twinId: number;
  accountId: string;
  ip: string;
}

export class TwinsClient extends AbstractClient<TwinsBuilder, TwinsQuery> {
  constructor(uri: string) {
    super({
      uri,
      Builder: TwinsBuilder,
    });
  }

  public async list(queries: Partial<TwinsQuery> = {}) {
    const res = await this.builder(queries).build("/twins");
    return resolvePaginator<Twin[]>(res);
  }
}
