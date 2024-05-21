import { inspect } from "util";

import { GridClient, NodeInfo } from "../src";

function log(message) {
  console.log(inspect(message, { showHidden: false, depth: null, colors: true }));
}

async function pingNodes(client: GridClient, nodes: NodeInfo[]): Promise<number> {
  /**
   * Attempts to ping a list of nodes sequentially and returns the ID of the first responsive node.
   *
   * This function iterates through an array of nodes, pinging each one to check its responsiveness.
   * It returns the ID of the first node that responds successfully. If no nodes respond, an error is thrown.
   *
   * @param {GridClient} client - An instance of the GridClient used to ping the nodes.
   * @param {NodeInfo[]} nodes - An array of node information objects.
   * @returns {Promise<number>} - A promise that resolves to the nodeId of the first responsive node.
   * @throws {Error} - Throws an error if none of the nodes respond successfully.
   */
  for (const node of nodes) {
    try {
      await client.zos.pingNode({ nodeId: node.nodeId });
      return node.nodeId;
    } catch (error) {
      log("node " + node.nodeId + " is not responding, trying different node.");
    }
  }
  throw new Error("There are no available nodes. Please try changing the filters you have applied.");
}

export { log, pingNodes };
