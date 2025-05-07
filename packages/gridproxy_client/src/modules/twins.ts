import { TwinsBuilder, TwinsQuery } from "../builders/twins";
import { resolvePaginator } from "../utils";
import { AbstractClient } from "./abstract_client";

export interface Twin {
  twinId: number;
  accountId: string;
  relay: string;
  publicKey: string;
}

export interface Consumption {
  last_hour_consumption: number;
  overall_consumption: number;
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

  public async getConsumption(twinId: number): Promise<Consumption> {
    const res = await this.builder().build(`/twins/${twinId}/consumption`);
    return res.json();
  }
}
