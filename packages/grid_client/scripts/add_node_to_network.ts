import { NetworkAddNodeModel } from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function addNode(client, node) {
  try {
    const res = await client.networks.addNode(node);
    log("================= Adding node =================");
    log(res);
    log("================= Adding node =================");
  } catch (error) {
    log("Error while adding node " + error);
  }
}

async function main() {
  const grid3 = await getClient();
  const node: NetworkAddNodeModel = {
    name: "wedtest",
    ipRange: "10.249.0.0/16",
    nodeId: 14,
  };
  // if the network is not created, it will create one and add this node to it.
  await addNode(grid3, node);

  await grid3.disconnect();
}
main();
