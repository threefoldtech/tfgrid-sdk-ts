import {
  type GridNode,
  type NodesExtractOptions,
  type NodesQuery,
  type NodeStats,
  NodeStatus,
  type Pagination,
} from "@threefold/gridproxy_client";
import { byCountry } from "country-code-lookup";

import { gridProxyClient } from "@/clients";

import type { MixedFilter, NodeStatusColor } from "./types";

export const getCountryCode = (node: GridNode): string => {
  if (!node) {
    return "";
  }
  if (!node.country) {
    return "";
  }
  if (node.country.length && node.country.length > 2) {
    const country = byCountry(node.country);
    if (!country) {
      return node.country;
    }
    const countryCode = country.internet;
    if (countryCode !== null && countryCode !== undefined) {
      return countryCode;
    }
  }
  return node.country;
};

/**
 * Get the node status then return the color based on the status type.
 * @param {string} status - the ststus of the node, it should be match one of these statuses [up, standby, down].
 * @returns {NodeStatusColor} - return type of the node status color and status
 */
export const getNodeStatusColor = (status: string): NodeStatusColor => {
  if (status === NodeStatus.Up) {
    return { color: "primary", status: NodeStatus.Up };
  } else if (status === NodeStatus.Standby) {
    return { color: "warning", status: NodeStatus.Standby };
  } else {
    return { color: "error", status: NodeStatus.Down };
  }
};

/**
 * Requests a list of nodes from the GridProxyClient.
 *
 * @param {Partial<NodesQuery>} options - The options for querying the nodes.
 * @param {NodeRequestConfig} config - The configuration for the node request.
 * @returns {Promise<Pagination<GridNode[]>>} - A promise that resolves to a pagination object containing the list of nodes.
 */
export async function requestNodes(
  options: Partial<NodesQuery>,
  config: NodesExtractOptions,
): Promise<Pagination<GridNode[]>> {
  try {
    const nodes: Pagination<GridNode[]> = await gridProxyClient.nodes.list(options, config);
    return nodes;
  } catch (error) {
    console.error("An error occurred while requesting nodes:", error);
    throw error;
  }
}

/**
 * Requests a node from GridProxyClient to get its stats.
 * @param {number} nodeId - The node id.
 * @returns {Promise<NodeStats>} - A promise that resolves to an object containing the node stats details.
 */
export async function getNodeStates(nodeId: number): Promise<NodeStats> {
  if (typeof nodeId !== "number" || isNaN(nodeId)) {
    throw new Error("Invalid nodeId");
  }
  const nodeStats: NodeStats = await gridProxyClient.nodes.statsById(nodeId);
  if (nodeStats.system) {
    return nodeStats;
  } else {
    throw new Error(`Failed to retrieve node stats`);
  }
}

/**
 * Requests a node from GridProxyClient.
 * @param {number} nodeId - The node id.
 * @param {NodesExtractOptions} config - The configuration for the node request.
 * @returns {Promise<GridNode>} - A promise that resolves to an object containing the node details.
 */
export async function getNode(nodeId: number, config: NodesExtractOptions): Promise<GridNode> {
  if (typeof nodeId !== "number" || nodeId <= 0) {
    throw new Error("Invalid nodeId. Expected a positive integer.");
  }

  if (typeof config !== "object" || config === null) {
    throw new Error("Invalid config parameter. Expected an object.");
  }

  try {
    const node: GridNode = await gridProxyClient.nodes.byId(nodeId, config);
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

export const getQueries = (mixedFilters: MixedFilter): Partial<NodesQuery> => {
  const options: Partial<NodesQuery> = {
    retCount: true,
    nodeId: +mixedFilters.inputs.nodeId.value! || undefined,
    farmIds: mixedFilters.inputs.farmIds.value,
    farmName: mixedFilters.inputs.farmName.value,
    country: mixedFilters.inputs.country.value,
    status: mixedFilters.options.status ? (mixedFilters.options.status.toLocaleLowerCase() as NodeStatus) : undefined,
    page: mixedFilters.options.page,
    size: mixedFilters.options.size,
    freeHru: mixedFilters.inputs.freeHru.value ? toBytes(+mixedFilters.inputs.freeHru.value!) : undefined,
    freeMru: mixedFilters.inputs.freeMru.value ? toBytes(+mixedFilters.inputs.freeMru.value!) : undefined,
    freeSru: mixedFilters.inputs.freeSru.value ? toBytes(+mixedFilters.inputs.freeSru.value!) : undefined,
    hasGpu: mixedFilters.options.gpu ? mixedFilters.options.gpu : undefined,
  };
  if (mixedFilters.options.gateway) {
    options.domain = mixedFilters.options.gateway;
    options.ipv4 = mixedFilters.options.gateway;
  }
  return options;
};
