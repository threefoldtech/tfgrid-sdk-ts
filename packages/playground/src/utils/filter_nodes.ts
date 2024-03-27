import type { GridClient } from "@threefold/grid_client";

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
  certified?: string;
}

export async function getNodeCards(grid: GridClient, nodeId: number): Promise<NodeGPUCardType[]> {
  return grid.zos.getNodeGPUInfo({ nodeId });
}
