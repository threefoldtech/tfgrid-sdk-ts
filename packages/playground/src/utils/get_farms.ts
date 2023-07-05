import type { FilterOptions, GridClient, NodeInfo } from "@threefold/grid_client";

import { gqlClient, gridProxyClient } from "../clients";
import { updateGrid } from "./grid";
import { loadVms, mergeLoadedDeployments } from "./load_deployment";

const getUsedFarmsSet = (() => {
  const _farmStore = new Map<string, Set<number>>();

  return async (grid: GridClient, projectName: string): Promise<Set<number>> => {
    if (_farmStore.has(projectName)) {
      return _farmStore.get(projectName)!;
    }

    const filter = ([vm]: [{ flist: string }]) => vm.flist.replace(/-/g, "").includes(projectName.toLowerCase());
    const vms = mergeLoadedDeployments(
      await loadVms(updateGrid(grid, { projectName })),
      await loadVms(updateGrid(grid, { projectName: projectName.toLowerCase() })),
      await loadVms(updateGrid(grid, { projectName: "" }), { filter }),
    );

    const nodeIds = vms.items.map(vm => vm[0].nodeId);
    const farms = await Promise.all(Array.from(new Set(nodeIds)).map(id => gridProxyClient.nodes.byId(id)));
    const farmSet = new Set(farms.map(farm => farm.farmId));
    _farmStore.set(projectName, farmSet);
    return farmSet;
  };
})();

export interface GetFarmsOptions {
  exclusiveFor?: string;
  oncePerFarm?: boolean;
  projectName?: string;
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

  if (!filters.publicIPs) {
    if (options.exclusiveFor) {
      const blockedFarms = await getBlockedFarmSet(options.exclusiveFor);
      farmIds = farmIds.filter(id => !blockedFarms.has(id));
    }

    if (options.oncePerFarm) {
      if (typeof options.projectName !== "string") {
        throw new Error("Please provide a valid projectName to list deployments.");
      }

      const usedFarms = await getUsedFarmsSet(grid, options.projectName);
      farmIds = farmIds.filter(id => !usedFarms.has(id));
    }
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
