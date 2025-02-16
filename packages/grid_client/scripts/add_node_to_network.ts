import { GridClient, NetworkAddNodeModel } from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function addNode(client: GridClient, node: NetworkAddNodeModel) {
  const res = await client.networks.addNode(node);
  log("================= Adding node =================");
  log(res);
  log("================= Adding node =================");
}

async function main() {
  // User should change the name to an existing vm.
  const name = "vmu0sir";
  const grid3: GridClient = await getClient(`vm/${name}`);
  const node: NetworkAddNodeModel = {
    name: `net${name}`,
    ipRange: "10.249.0.0/16",
    nodeId: 14,
    mycelium: true,
  };
  // if the network is not created, it will create one and add this node to it.
  await addNode(grid3, node);
  await grid3.disconnect();
}
main();
