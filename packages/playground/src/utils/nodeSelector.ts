import type { FarmFilterOptions, FarmInfo, GridClient } from "@threefold/grid_client";
import { NodeStatus } from "@threefold/gridproxy_client";

import { gqlClient, gridProxyClient } from "../clients";
import type { Locations, NodeSelectorFilters, NormalizeFarmFiltersOptions } from "../types/nodeSelector";

export async function getLocations(): Promise<Locations> {
  const countries = await gqlClient.countries({ name: true, subregion: true });
  const stats = await gridProxyClient.stats.get({ status: NodeStatus.Up });
  const allowedCountriesList = Object.keys(stats.nodesDistribution);

  const locations: Locations = {};
  for (const country of countries) {
    if (allowedCountriesList.includes(country.name)) {
      locations[country.subregion] = locations[country.subregion] || [];
      locations[country.subregion].push(country.name);
    }
  }
  return locations;
}

export function normalizeFarmFilters(
  filters: NodeSelectorFilters,
  options: NormalizeFarmFiltersOptions,
): FarmFilterOptions {
  return {
    size: options.size,
    page: options.page,
    availableFor: options.twinId,
    country: options.location.country,
    region: options.location.region,
    nodeMRU: filters.memory ? Math.round(filters.memory / 1024) : undefined,
    nodeRentedBy: filters.dedicated ? options.twinId : undefined,
    nodeHRU: (filters.hddDisks || []).reduce((t, d) => t + d, 0) || undefined,
    nodeSRU:
      (filters.ssdDisks || []).reduce(
        (t, d) => t + d,
        (filters.solutionDisk || 0) + (filters.rootFilesystemSize || 0),
      ) || undefined,
    publicIp: filters.ipv4,
    nodeCertified: filters.certified,
    nodeHasGPU: filters.hasGPU,
  };
}

export async function loadFarms(grid: GridClient, filters: FarmFilterOptions, exclusiveFor?: string) {
  const farms = await grid.capacity.filterFarms(filters);

  if (exclusiveFor && !filters.publicIp) {
    const blockedFarms = await getBlockedFarmSet(exclusiveFor);
    return farms.filter(farm => !blockedFarms.has(farm.farmId));
  }

  return farms;
}

export async function getBlockedFarmSet(exclusiveFor: string) {
  const { totalCount } = await gqlClient.nodeContractsConnection(
    { totalCount: true },
    {
      orderBy: ["id_ASC"],
      where: {
        deploymentData_contains: exclusiveFor,
        state_eq: "Created",
        numberOfPublicIPs_eq: 0,
      },
    },
  );

  const nodes = await gqlClient.nodeContracts(
    { nodeID: true },
    {
      limit: totalCount,
      where: {
        deploymentData_contains: exclusiveFor,
        state_eq: "Created",
        numberOfPublicIPs_eq: 0,
      },
    },
  );

  const farms = await Promise.all(
    Array.from(new Set(nodes.map(node => node.nodeID))).map(id => gridProxyClient.nodes.byId(id)),
  );
  return new Set(farms.map(farm => farm.farmId));
}

export async function searchFarms(query: string) {
  const { data } = await gridProxyClient.farms.list({ nameContains: query });
  return data as FarmInfo[];
}
