import type { FilterOptions, GridClient, NodeInfo } from "@threefold/grid_client";

import type { NodeFilters } from "@/components/select_node.vue";

export interface NodeGPUCardType {
  id: string;
  vendor: string;
  device: string;
  contract: number;
}
export interface INode {
  nodeId: number;
  state?: string;
  cards?: NodeGPUCardType[];
}

export async function getNodeCards(grid: GridClient, nodeId: number): Promise<NodeGPUCardType[]> {
  return grid.zos.getNodeGPUInfo({ nodeId });
}

export async function getFilteredNodes(grid: GridClient, options: NodeFilters): Promise<NodeInfo[]> {
  const filters: FilterOptions = {
    farmId: options.farmId ? options.farmId : undefined,
    cru: options.cpu,
    mru: Math.round(options.memory / 1024),
    sru: options.diskSizes.reduce((total, disk) => total + disk),
    publicIPs: options.ipv4,
    hasGPU: options.hasGPU,
    rentedBy: options.rentedBy ? grid.twinId : undefined,
    certified: options.certified,
    availableFor: grid.twinId,
  };
  const nodes = await grid.capacity.filterNodes(filters);
  return nodes;
}
