import { getClient } from "./client_loader";
import { log } from "./utils";

async function pingNode(client, nodeId) {
  try {
    const res = await client.zos.pingNode(nodeId);
    log("================= Ping result =================");
    log(res);
    log("================= Ping result =================");
  } catch (error) {
    log(`Node ${nodeId.nodeId} is offline`);
  }
}

async function main() {
  const grid3 = await getClient();
  const node1 = 1;
  const node2 = 1111111111;

  await pingNode(grid3, { nodeId: node1 });

  await pingNode(grid3, { nodeId: node2 });

  await grid3.disconnect();
}

main();
