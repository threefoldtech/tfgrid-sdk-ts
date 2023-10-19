import type { Network, Stats } from "@threefold/gridproxy_client";
import GridProxyClient, { NodeStatus } from "@threefold/gridproxy_client";
import { defineStore } from "pinia";

import { type NetworkStats } from "@/types/index";

export const useStatsStore = defineStore("stats", {
  state(): NetworkStats {
    return {};
  },
  actions: {
    async getStats(network: Network) {
      try {
        const client = new GridProxyClient(network);
        const stats = await client.stats.get({ status: NodeStatus.Up });
        this[network] = stats;
      } catch (error) {
        throw new Error(`Failed to retrieve ${network} network statistics`);
      }
    },
  },
  getters: {
    getNetworkStats: (stats: NetworkStats) => {
      return (network: Network): Stats | undefined => stats[network];
    },
  },
});
