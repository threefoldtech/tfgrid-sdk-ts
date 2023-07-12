import type { FilterOptions, GridClient, NodeInfo } from "@threefold/grid_client";

import { gqlClient, gridProxyClient } from "../clients";

export interface GetFarmsOptions {
  exclusiveFor?: string;
}
export async function getFarms(grid: GridClient, filters: FilterOptions, options: GetFarmsOptions = {}) {
  const nodes: NodeInfo[][] = [];

  let page = 1;
  while (page) {
    const _nodes = await grid.capacity.filterNodes({ ...filters, page }).catch(() => []);
    nodes.push(_nodes);
    page = nodes[page - 1].length ? ++page : 0;
  }

  let farmIds = Array.from(new Set(nodes.flat(1).map(node => node.farmId)));

  if (options.exclusiveFor && !filters.publicIPs) {
    const blockedFarms = await getBlockedFarmSet(options.exclusiveFor);
    farmIds = farmIds.filter(id => !blockedFarms.has(id));
  }

  return gqlClient.farms(
    { farmID: true, name: true },
    { orderBy: ["farmID_ASC"], where: { farmID_in: farmIds }, limit: farmIds.length },
  );
}

export async function getBlockedFarmSet(exclusiveFor: string): Promise<Set<number>> {
  const { totalCount } = await gqlClient.nodeContractsConnection(
    { totalCount: true },
    {
      orderBy: ["id_ASC"],
      where: { deploymentData_contains: exclusiveFor, state_eq: "Created", numberOfPublicIPs_eq: 0 },
    },
  );

  const nodes = await gqlClient.nodeContracts(
    { nodeID: true },
    {
      limit: totalCount,
      where: { deploymentData_contains: exclusiveFor, state_eq: "Created", numberOfPublicIPs_eq: 0 },
    },
  );

  const farms = await Promise.all(
    Array.from(new Set(nodes.map(node => node.nodeID))).map(id => gridProxyClient.nodes.byId(id)),
  );
  return new Set(farms.map(farm => farm.farmId));
}
