import type { FilterOptions, GridClient, NodeInfo } from "@threefold/grid_client";

import type { NodeFilters } from "@/components/select_node.vue";

export interface Node {
  nodeId: number;
  state?: string;
}

export async function getFilteredNodes(grid: GridClient, options: NodeFilters): Promise<NodeInfo[]> {
  const filters: FilterOptions = {
    farmId: options.farmId,
    cru: options.cpu,
    mru: Math.round(options.memory / 1024),
    sru: options.disks.reduce((total, disk) => total + disk.size, 2),
    publicIPs: options.ipv4,
    availableFor: grid.twinId,
    hasGPU: options.hasGPU,
    rentedBy: options.rentedBy ? grid.twinId : undefined,
    certified: options.certified,
  };
  const nodes = await grid.capacity.filterNodes(filters);
  return nodes;
}
