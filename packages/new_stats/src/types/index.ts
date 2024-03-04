import type { Stats } from "@threefold/gridproxy_client";

export interface IStatistics {
  data: number | string;
  title: string;
  icon: string;
}
export type NetworkStats = {
  [network: string]: Stats;
};
