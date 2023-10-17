import type { Network, Stats } from "@threefold/gridproxy_client";
import GridProxyClient, { NodeStatus } from "@threefold/gridproxy_client";

import { type NetworkStats } from "@/types/index";

export default {
  state(): NetworkStats {
    return {};
  },
  mutations: {
    setNetworkStats(state: NetworkStats, payload: { stats: Stats; network: Network }) {
      state[payload.network] = payload.stats;
    },
  },
  actions: {
    getStats: async ({ commit }: any, network: Network) => {
      try {
        const client = new GridProxyClient(network);
        const stats = await client.stats.get({ status: NodeStatus.Up });
        commit("setNetworkStats", { stats, network });
      } catch (error) {
        throw new Error(`Failed to retrieve ${network} network statistics`);
      }
    },
  },
  getters: {
    getNetworkStats:
      (stats: NetworkStats) =>
      (network: Network): Stats | undefined =>
        stats[network],
  },
};
