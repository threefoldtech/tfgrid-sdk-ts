import { StatsBuilder, StatsQuery } from "../builders/public_api";
import { AbstractClient } from "./abstract_client";

export interface Stats {
  nodes: number;
  farms: number;
  countries: number;
  totalCru: number;
  totalSru: number;
  totalMru: number;
  totalHru: number;
  publicIps: number;
  accessNodes: number;
  gateways: number;
  twins: number;
  contracts: number;
  nodesDistribution: { [key: string]: number };
}

export class StatsClient extends AbstractClient<StatsBuilder, StatsQuery> {
  constructor(uri: string) {
    super({
      uri,
      Builder: StatsBuilder,
    });
  }

  public async get(queries: Partial<StatsQuery> = {}): Promise<Stats> {
    const res = await this.builder(queries).build("/stats");
    return res.json();
  }
}
