import GridProxyClient, { Network, NodeStatus, type Stats } from "@threefold/gridproxy_client";

import type { NetworkStats } from "@/types";

function mergeStatsData(stats: Stats[]): Stats {
  const res = stats[0];
  for (let i = 1; i < stats.length; i++) {
    res.accessNodes += stats[i].accessNodes;
    res.contracts += stats[i].contracts;
    res.countries += stats[i].countries;
    res.farms += stats[i].farms;
    res.gateways += stats[i].gateways;
    res.nodes += stats[i].nodes;
    res.publicIps += stats[i].publicIps;
    res.totalCru += stats[i].totalCru;
    res.totalHru += stats[i].totalHru;
    res.totalMru += stats[i].totalMru;
    res.totalSru += stats[i].totalSru;
    res.twins += stats[i].twins;
    res.nodesDistribution = mergeNodeDistribution([res.nodesDistribution, stats[i].nodesDistribution]);
  }

  return res;
}

export async function getStats(network: Network): Promise<Stats> {
  try {
    const client = new GridProxyClient(network);
    const upStats = await client.stats.get({ status: NodeStatus.Up });
    const standbyStats = await client.stats.get({ status: NodeStatus.Standby });
    return mergeStatsData([upStats, standbyStats]);
  } catch (error) {
    throw new Error(`Failed to retrieve ${network} network statistics: ${error}`);
  }
}

function mergeNodeDistribution(stats: Stats["nodesDistribution"][]) {
  const keys = new Set(stats.map(obj => Object.keys(obj)).flat());

  return Array.from(keys).reduce((res, key) => {
    res[key] = 0;
    stats.forEach(country => {
      res[key] += country[key] ?? 0;
    });
    return res;
  }, {} as { [key: string]: number });
}

export function formatData(network: Network[] = [Network.Main], totalStat: NetworkStats) {
  let res: Stats = {
    nodes: 0,
    farms: 0,
    countries: 0,
    totalCru: 0,
    totalSru: 0,
    totalMru: 0,
    totalHru: 0,
    publicIps: 0,
    accessNodes: 0,
    gateways: 0,
    twins: 0,
    contracts: 0,
    nodesDistribution: {},
  };
  for (let i = 0; i < network.length; i++) {
    const currentStats = totalStat[network[i]];
    if (!currentStats) continue;
    res = mergeStatsData([res, currentStats]);
  }

  return res;
}
