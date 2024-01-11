import { PingNodeOptionsModel } from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function pingNode(client, nodeId) {
  const res = await client.zos.pingNode(nodeId);
  log("================= Ping result =================");
  log(res);
  log("================= Ping result =================");
}

async function main() {
  const grid3 = await getClient();
  const node1: PingNodeOptionsModel = {
    nodeId: 1,
  };
  const node2: PingNodeOptionsModel = {
    nodeId: 1111111111,
  };

  await pingNode(grid3, node1);

  await pingNode(grid3, node2);

  await grid3.disconnect();
}

main();
