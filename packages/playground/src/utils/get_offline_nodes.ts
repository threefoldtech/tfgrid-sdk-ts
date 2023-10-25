import { type FilterOptions, type GridClient, type NodeInfo, NodeStatus } from "@threefold/grid_client";
import { ref } from "vue";

const requestPageNumber = ref<number>(1);
const offlineNodes = ref<NodeInfo[]>([]);
type NodeFilters = FilterOptions & {
  /**
   * The flat option used to return a list of the ids of the nodes, it'll be like [1, 2, 3] where is the 1, 2 and 3 represent the ids of the nodes.
   * @returns {Promise<number[]>} A Promise that resolves to an array of offline NodeInfo ids.
   */
  flat?: boolean;
};

/**
 * Retrieves offline nodes from the grid proxy using the grid client.
 * If requestPageNumber is 0, returns the existing offline nodes data,
 * otherwise fetches the next page of offline nodes and appends it to the result.
 * @param {GridClient | null} grid - The GridClient instance to fetch nodes from.
 * @returns {Promise<NodeInfo[]>} A Promise that resolves to an array of offline NodeInfo objects.
 */
export async function getOfflineNodes(grid: GridClient | null, options?: NodeFilters): Promise<NodeInfo[] | number[]> {
  const isFlat = options?.flat || false;

  const isLastPage = requestPageNumber.value === 0;

  if (isLastPage) {
    if (isFlat) {
      return offlineNodes.value.map(node => node.nodeId);
    }
    return offlineNodes.value;
  } else {
    const offNodes: NodeInfo[] = await grid!.nodes.filter({
      ...options,
      status: NodeStatus.down,
      page: requestPageNumber.value,
    });

    if (offNodes.length) {
      offlineNodes.value.push(...offNodes);
      requestPageNumber.value += 1;
    } else {
      // needs to be last page.
      requestPageNumber.value = 0;
    }
  }
  return getOfflineNodes(grid, options);
}
