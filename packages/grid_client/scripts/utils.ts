import { inspect } from "util";

function log(message) {
  console.log(inspect(message, { showHidden: false, depth: null, colors: true }));
}

async function pingNodes(client, nodes) {
  for (const node of nodes) {
    try {
      await client.zos.pingNode({ nodeId: node.nodeId });
      return node.nodeId;
    } catch (error) {
      log("node " + node.nodeId + " is not responding, trying different node.");
    }
  }
  throw new Error("No avaiable nodes");
}

export { log, pingNodes };
