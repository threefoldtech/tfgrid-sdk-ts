import GridProxyClient, {
  type GridNode,
  type NodesQuery,
  type NodeStats,
  type Pagination,
} from "@threefold/gridproxy_client";

import type { MixedFilter } from "./types";

const network = process.env.NETWORK || (window as any).env.NETWORK;
const client = new GridProxyClient(network);

export async function requestNodes(options: Partial<NodesQuery>, loadFarm?: boolean): Promise<Pagination<GridNode[]>> {
  const nodes: Pagination<GridNode[]> = await client.nodes.list(options, { loadFarm: loadFarm });
  return nodes;
}

export async function getNodeStates(nodeId: number): Promise<NodeStats> {
  const nodeStats: NodeStats = await client.nodes.statsById(nodeId);
  return nodeStats;
}

export async function getNode(nodeId: number): Promise<GridNode> {
  const node: GridNode = await client.nodes.byId(nodeId);
  return node;
}

export const toBytes = (resource: number | undefined): number => {
  return resource ? resource * 1024 * 1024 * 1024 : 0;
};

export const getFilterValues = (mixedFilters: MixedFilter): Partial<NodesQuery> => {
  const options: Partial<NodesQuery> = {
    retCount: true,
    nodeId: +mixedFilters.inputs.nodeId.value! || undefined,
    farmIds: mixedFilters.inputs.farmIds.value,
    farmName: mixedFilters.inputs.farmName.value,
    country: mixedFilters.inputs.country.value,
    status: mixedFilters.options.status,
    page: mixedFilters.options.page,
    size: mixedFilters.options.size,
    freeHru: toBytes(+mixedFilters.inputs.freeHru.value!),
    freeMru: toBytes(+mixedFilters.inputs.freeMru.value!),
    freeSru: toBytes(+mixedFilters.inputs.freeSru.value!),
    hasGpu: mixedFilters.options.gpu,
  };
  if (mixedFilters.options.gateway) {
    options.domain = mixedFilters.options.gateway;
    options.ipv4 = mixedFilters.options.gateway;
  }
  return options;
};
