import type GridProxyClient from "@threefold/gridproxy_client";
import type { GridNode, NodesQuery, NodeStats, Pagination } from "@threefold/gridproxy_client";

import type { MixedFilter, NodeRequestConfig } from "./types";

/**
 * Requests a list of nodes from the GridProxyClient.
 *
 * @param {Partial<NodesQuery>} options - The options for querying the nodes.
 * @param {NodeRequestConfig} config - The configuration for the node request.
 * @param {GridProxyClient} client - The GridProxyClient instance.
 * @returns {Promise<Pagination<GridNode[]>>} - A promise that resolves to a pagination object containing the list of nodes.
 */
export async function requestNodes(
  options: Partial<NodesQuery>,
  config: NodeRequestConfig,
  client: GridProxyClient,
): Promise<Pagination<GridNode[]>> {
  try {
    const nodes: Pagination<GridNode[]> = await client.nodes.list(options, config);
    return JSON.parse(JSON.stringify(nodes));
  } catch (error) {
    console.error("An error occurred while requesting nodes:", error);
    throw error;
  }
}

/**
 * Requests a node from GridProxyClient to get its stats.
 * @param {number} nodeId - The node id.
 * @param {GridProxyClient} client - The GridProxyClient instance.
 * @returns {Promise<NodeStats>} - A promise that resolves to an object containing the node stats details.
 */
export async function getNodeStates(nodeId: number, client: GridProxyClient): Promise<NodeStats> {
  if (typeof nodeId !== "number" || isNaN(nodeId)) {
    throw new Error("Invalid nodeId");
  }
  const nodeStats: NodeStats = await client.nodes.statsById(nodeId);
  if (nodeStats.system) {
    return nodeStats;
  } else {
    throw new Error(`Failed to retrieve node stats`);
  }
}

/**
 * Requests a node from GridProxyClient.
 * @param {number} nodeId - The node id.
 * @param {GridProxyClient} client - The GridProxyClient instance.
 * @returns {Promise<GridNode>} - A promise that resolves to an object containing the node details.
 */
export async function getNode(nodeId: number, config: NodeRequestConfig, client: GridProxyClient): Promise<GridNode> {
  if (typeof nodeId !== "number" || nodeId <= 0) {
    throw new Error("Invalid nodeId. Expected a positive integer.");
  }

  if (typeof config !== "object" || config === null) {
    throw new Error("Invalid config parameter. Expected an object.");
  }

  try {
    const node: GridNode = await client.nodes.byId(nodeId, config);
    return node;
  } catch (error: any) {
    throw new Error(`Failed to get node: ${error.message}`);
  }
}

/**
 * Convert into bytes.
 * @param {number} resource - The resource in GB.
 * @returns {number} - The resource in Bytes.
 */
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
