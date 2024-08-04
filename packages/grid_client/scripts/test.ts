import { FilterOptions, GridClient, log, NodeInfo } from "../src";
import { getClient } from "./client_loader";

async function pingNodes(client: GridClient, nodes: NodeInfo[]) {
  for (const node of nodes) {
    try {
      const x = await client.zos.getNodePerfTests({ nodeId: node.nodeId });
      console.log({ x });
    } catch (error) {
      log("node " + node.nodeId + " is not responding, trying different node.");
    }
  }
}

async function main() {
  const name = "newVMS";
  const grid3 = await getClient(`vm/${name}`);
  const nodes = await grid3.capacity.filterNodes({
    gateway: true,
    farmId: 1,
    availableFor: await grid3.twins.get_my_twin_id(),
  } as FilterOptions);

  await pingNodes(grid3, nodes);

  await grid3.disconnect();
}

main();
