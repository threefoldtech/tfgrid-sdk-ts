import type { FarmFilterOptions, FarmInfo, FilterOptions, NodeInfo } from "@threefold/grid_client";
import { NodeStatus } from "@threefold/gridproxy_client";
import shuffle from "lodash/fp/shuffle.js";
import type { Ref } from "vue";
import { z } from "zod";

import { gqlClient, gridProxyClient } from "../clients";
import type { useGrid } from "../stores";
import type {
  Locations,
  NormalizeFarmFiltersOptions,
  NormalizeNodeFiltersOptions,
  SelectedLocation,
  SelectionDetailsFilters,
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
  filters: SelectionDetailsFilters,
  options: NormalizeFarmFiltersOptions,
): FarmFilterOptions {
  return {
    size: options.size,
    page: Math.max(1, options.page),
    availableFor: options.twinId,
    country: options.location.country,
    region: options.location.region,
    nodeCRU: filters.cpu,
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
  const pages = shuffle(Array.from({ length: count - 1 }, (_, i) => i + 1));
  for (const page of pages) {
    yield page;
  }
  yield count;
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
  farm: FarmInfo | undefined,
): NormalizeNodeFiltersOptions {
  return {
    size: window.env.PAGE_SIZE,
    page: page.value,
    location: location || {},
    twinId: gridStore.client.twinId,
    farm,
  };
}

export function normalizeNodeFilters(
  filters: SelectionDetailsFilters,
  options: NormalizeNodeFiltersOptions,
): FilterOptions {
  return {
    page: Math.max(1, options.page),
    size: options.size,
    farmId: options.farm?.farmId,
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

export async function getNodeGpuCards(gridStore: ReturnType<typeof useGrid>, node: NodeInfo) {
  // cards might return as null if not supported or something went wrong
  const cards = await gridStore.client.zos.getNodeGPUInfo(node);
  return cards || [];
}

export async function resolveAsync<T>(promise: Promise<T>): Promise<[T, null]>;
export async function resolveAsync<T, E>(promise: Promise<T>): Promise<[null, E]>;
export async function resolveAsync(promise: Promise<any>): Promise<any> {
  try {
    return [await promise, null];
  } catch (error) {
    return [null, error];
  }
}

const selectionDetailsFiltersValidator = z.object({
  ipv4: z.boolean().optional(),
  ivp6: z.boolean().optional(),
  hasGPU: z.boolean().optional(),
  cpu: z.number().int().min(1).max(32),
  memory: z.number().int().min(256).max(262144),
  ssdDisks: z.array(z.number().min(1).max(10000)).optional(),
  hddDisks: z.array(z.number().min(1).max(10000)).optional(),
  rootFilesystemSize: z
    .number()
    .min(500 / 1024)
    .optional(),
  solutionDisk: z.number().int().min(10).max(10000).optional(),
  certified: z.boolean().optional(),
  dedicated: z.boolean().optional(),
  exclusiveFor: z.string().optional(),
});

export function isValidSelectionDetailsFilters(filters: SelectionDetailsFilters): boolean {
  return selectionDetailsFiltersValidator.safeParse(filters).success;
}

export async function checkNodeCapacityPool(
  gridStore: ReturnType<typeof useGrid>,
  node: NodeInfo | undefined | null,
  filters: SelectionDetailsFilters,
): Promise<true> | never {
  if (!node || !node.nodeId) {
    throw "Node ID is required.";
  }

  try {
    await gridStore.client.capacity.checkNodeCapacityPool({
      nodeId: node.nodeId,
      ssdDisks: [filters.solutionDisk ?? 0, ...(filters.ssdDisks || [])].filter(Boolean).map(disk => disk * 1024 ** 3),
      rootfsDisks: [(filters.rootFilesystemSize ?? 0) * 1024 ** 3],
      hddDisks: filters.hddDisks || [],
    });
    return true;
  } catch (error) {
    if (error?.toString().includes("Cannot fit the required SSD disk with size")) {
      throw (
        "Although node " +
        node.nodeId +
        " appears to have sufficient storage capacity for your workload, it lacks a single internal " +
        "partition capable of accommodating it. Please select a different node."
      );
    }

    throw "Something went wrong while checking status of the node. Please check your connection and try again.";
  }
}
