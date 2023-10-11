import { getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
  const grid3 = await getClient();
  try {
    // if the network is not created, it will create one and add this node to it.
    const res = await grid3.networks.addNode({
      name: "wedtest",
      ipRange: "10.249.0.0/16",
      nodeId: 14,
    });
    log(res);
  } finally {
    grid3.disconnect();
  }
}
main();
