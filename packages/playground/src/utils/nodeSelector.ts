import type { FarmFilterOptions, FarmInfo, FilterOptions, NodeInfo } from "@threefold/grid_client";
import { NodeStatus } from "@threefold/gridproxy_client";
import shuffle from "lodash/fp/shuffle.js";
import type { Ref } from "vue";

import { gqlClient, gridProxyClient } from "../clients";
import type { useGrid } from "../stores";
import type {
  Locations,
  NodeSelectorFilters,
  NormalizeFarmFiltersOptions,
  NormalizeNodeFiltersOptions,
  SelectedLocation,
} from "../types/nodeSelector";

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

export function normalizeFarmOptions(
  gridStore: ReturnType<typeof useGrid>,
  location: SelectedLocation | undefined,
  page: Ref<number>,
): NormalizeFarmFiltersOptions {
  return { size: window.env.PAGE_SIZE, page: page.value, location: location || {}, twinId: gridStore.client.twinId };
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
        (t, s) => t + s,
        (filters.solutionDisk ?? 0) + (filters.rootFilesystemSize ?? 0),
      ) || undefined,
    publicIp: filters.ipv4 || undefined,
    nodeCertified: filters.certified || undefined,
    nodeHasGPU: filters.hasGPU || undefined,
  };
}

export async function getFarmPageCount(gridStore: ReturnType<typeof useGrid>, filters: FarmFilterOptions) {
  const count = await gridStore.client.capacity.getFarmsCount(filters);
  return Math.ceil(count / window.env.PAGE_SIZE);
}

export function* createPageGen(count: number) {
  const pages = shuffle(Array.from({ length: count }, (_, i) => i + 1));
  for (const page of pages) {
    yield page;
  }

  return -1;
}

export async function loadFarms(
  gridStore: ReturnType<typeof useGrid>,
  filters: FarmFilterOptions,
  exclusiveFor?: string,
) {
  const farms = await gridStore.client.capacity.filterFarms(filters);

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

export function normalizeNodeOptions(
  gridStore: ReturnType<typeof useGrid>,
  location: SelectedLocation | undefined,
  page: Ref<number>,
  farm: Partial<FarmInfo>,
  gateway?: boolean,
): NormalizeNodeFiltersOptions {
  return {
    size: window.env.PAGE_SIZE,
    page: page.value,
    location: location || {},
    twinId: gridStore.client.twinId,
    farm,
    gateway,
  };
}

export function normalizeNodeFilters(
  filters: NodeSelectorFilters,
  options: NormalizeNodeFiltersOptions,
): FilterOptions {
  return {
    page: options.page,
    size: options.size,
    farmId: options.farm.farmId,
    cru: filters.cpu,
    mru: filters.memory ? Math.round(filters.memory / 1024) : undefined,
    hru: (filters.hddDisks || []).reduce((t, d) => t + d, 0) || undefined,
    sru:
      (filters.ssdDisks || []).reduce(
        (t, s) => t + s,
        (filters.solutionDisk ?? 0) + (filters.rootFilesystemSize ?? 0),
      ) || undefined,
    publicIPs: filters.ipv4 || undefined,
    hasGPU: filters.hasGPU || undefined,
    rentedBy: filters.dedicated ? options.twinId : undefined,
    certified: filters.certified || undefined,
    availableFor: options.twinId,
    region: options.location.region,
    country: options.location.country,
    gateway: options.gateway,
  };
}

export function loadNodes(gridStore: ReturnType<typeof useGrid>, filters: FilterOptions) {
  return gridStore.client.capacity.filterNodes(filters);
}

export async function getNodePageCount(gridStore: ReturnType<typeof useGrid>, filters: FarmFilterOptions) {
  const count = await gridStore.client.capacity.getNodesCount(filters);
  return Math.ceil(count / window.env.PAGE_SIZE);
}

export function getNodeGpuCards(gridStore: ReturnType<typeof useGrid>, node: NodeInfo) {
  return gridStore.client.zos.getNodeGPUInfo(node);
}

export async function resolveAsync<T, E>(promise: Promise<T>): Promise<[T, null]>;
export async function resolveAsync<T, E>(promise: Promise<T>): Promise<[null, E]>;
export async function resolveAsync(promise: Promise<any>): Promise<any> {
  try {
    return [await promise, null];
  } catch (error) {
    return [null, error];
  }
}
