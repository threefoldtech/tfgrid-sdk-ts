import type { Network, Stats } from "@threefold/gridproxy_client";

export interface IStatistics {
  data: number | string;
  title: string;
  icon: string;
}
export type NetworkStats = {
  [network in Network]?: Stats;
};
