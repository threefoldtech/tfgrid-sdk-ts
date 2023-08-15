import type { FarmFilterOptions, FarmInfo, GridClient } from "@threefold/grid_client";

import type { Farm } from "@/types";

import { gqlClient, gridProxyClient } from "../clients";

export interface GetFarmsOptions {
  exclusiveFor?: string;
}
export async function getFarms(
  grid: GridClient,
  filters: FarmFilterOptions,
  options: GetFarmsOptions = {},
): Promise<Farm[]> {
  let farms = await grid.capacity.filterFarms({ ...filters }).catch(() => []);

  if (options.exclusiveFor && !filters.publicIp) {
    const blockedFarms = await getBlockedFarmSet(options.exclusiveFor);
    farms = farms.filter(farm => !blockedFarms.has(farm.farmId));
  }

  return farms.map(farm => ({ name: farm.name, farmID: farm.farmId, country: filters.country }));
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
