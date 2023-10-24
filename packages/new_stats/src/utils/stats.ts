import GridProxyClient, { Network, NodeStatus, type Stats } from "@threefold/gridproxy_client";

import type { NetworkStats } from "@/types";

export async function getStats(network: Network): Promise<Stats> {
  try {
    const client = new GridProxyClient(network);
    return await client.stats.get({ status: NodeStatus.Up });
  } catch (error) {
    throw new Error(`Failed to retrieve ${network} network statistics`);
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
  const res: Stats = {
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
  const totalNodesDistribution = [];
  for (let i = 0; i < network.length; i++) {
    const target = totalStat[network[i]];
    if (target === undefined) continue;
    res.accessNodes += target.accessNodes;
    res.contracts += target.contracts;
    res.countries += target.countries;
    res.farms += target.farms;
    res.gateways += target.gateways;
    res.nodes += target.nodes;
    res.publicIps += target.publicIps;
    res.totalCru += target.totalCru;
    res.totalHru += target.totalHru;
    res.totalMru += target.totalMru;
    res.totalSru += target.totalSru;
    res.twins += target.twins;
    totalNodesDistribution.push(target.nodesDistribution);
  }

  res.nodesDistribution = mergeNodeDistribution(totalNodesDistribution);
  return res;
}
