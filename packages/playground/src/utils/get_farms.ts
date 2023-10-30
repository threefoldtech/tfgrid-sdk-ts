import type { FarmFilterOptions, FarmInfo, GridClient } from "@threefold/grid_client";
import type { Farm } from "@threefold/gridproxy_client";

import { gqlClient, gridProxyClient } from "../clients";

export interface GetFarmsOptions {
  exclusiveFor?: string;
}
export async function getFarms(
  grid: GridClient,
  filters: FarmFilterOptions,
  options: GetFarmsOptions = {},
): Promise<FarmInfo[]> {
  let farms = await grid.capacity.filterFarms({ ...filters }).catch(() => []);

  if (options.exclusiveFor && !filters.publicIp) {
    const blockedFarms = await getBlockedFarmSet(options.exclusiveFor);
    farms = farms.filter(farm => !blockedFarms.has(farm.farmId));
  }

  return farms;
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

export async function getAllFarms() {
  const farms = await gridProxyClient.farms.listAll();
  return farms;
}

export function fallbackDataExtractor(key: any, state?: any) {
  if (state) return state.data?.[key] ?? [];
  return (state: any) => state.data?.[key] ?? [];
}
export function getFarmPublicIPs(state: any, farmId: number): [number, number, number] {
  const farm = fallbackDataExtractor("farms")(state).find((f: { farmId: number }) => f.farmId === farmId);
  if (farm) {
    const freePublicIps = getFarmFreePublicIps(farm);
    const usedPublicIps = getFarmUsedPublicIps(farm);
    const totalPublicIps = farm.publicIPs.length;
    return [totalPublicIps, freePublicIps, usedPublicIps];
  }
  return [0, 0, 0];
}

export function getFarmFreePublicIps(farm: any): number {
  const freePublicIps = farm.publicIPs.filter((x: any) => x.contractId == 0);
  return freePublicIps.length;
}
export function getFarmUsedPublicIps(farm: any): number {
  const freePublicIps = farm.publicIPs.filter((x: any) => x.contractId != 0);
  return freePublicIps.length;
}
