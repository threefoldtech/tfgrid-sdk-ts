import type { FarmFilterOptions, GridClient } from "@threefold/grid_client";
import type { Farm, FarmsQuery, Pagination, Twin, TwinsQuery } from "@threefold/gridproxy_client";

import type { FarmInterface } from "@/types";

import { gqlClient, gridProxyClient } from "../clients";
import { createCustomToast, ToastType } from "./custom_toast";

export interface GetFarmsOptions {
  exclusiveFor?: string;
}
export async function getAllFarms(queries: Partial<FarmsQuery>): Promise<Pagination<Farm[]>> {
  try {
    const farms = await gridProxyClient.farms.list(queries);
    return farms;
  } catch (error) {
    console.error("An error occurred while requesting farms:", error);
    createCustomToast("Failed to get farms!", ToastType.danger);
    throw error;
  }
}
export async function getFarmsPages(grid: GridClient, filters: FarmFilterOptions, pageSize: number): Promise<number> {
  try {
    const count = (await grid.capacity.getFarmsCount(filters)) || 1;
    return Math.ceil(count / pageSize);
  } catch {
    return 1;
  }
}

export async function getFarms(
  grid: GridClient,
  filters: FarmFilterOptions,
  options: GetFarmsOptions = {},
): Promise<FarmInterface[]> {
  let farms;
  if (filters) {
    farms = await grid.capacity.filterFarms({ ...filters }).catch(() => []);
  } else {
    farms = await grid.capacity.getAllFarms().catch(() => []);
  }

  if (options.exclusiveFor && !filters.publicIp) {
    const blockedFarms = await getBlockedFarmSet(options.exclusiveFor);
    farms = farms.filter(farm => !blockedFarms.has(farm.farmId));
  }

  return farms.map(farm => ({
    name: farm.name,
    farmID: farm.farmId,
    country: filters.country as string,
    region: filters.region as string,
  }));
}
export async function getAllFarmsNames() {
  const farms = await gridProxyClient.farms.listAll();
  const names = farms.map((farm: { name: any }) => farm.name);
  return names;
}

export async function getBlockedFarmSet(exclusiveFor: string): Promise<Set<number>> {
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
export async function getFarmTwinByTwinId(queries: Partial<TwinsQuery> = {}): Promise<Twin> {
  try {
    const twins = await gridProxyClient.twins.list(queries);

    if (twins.count == null) {
      return { twinId: queries.twinId } as Twin;
    }
    return twins.data[0] as Twin;
  } catch (error) {
    console.error("An error occurred while requesting twins:", error);
    throw error;
  }
}
