import { NodePowerModel } from "../src/modules";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function setNodePower(client, nodePower) {
  try {
    const res = await client.nodes.setNodePower(nodePower);
    log("================= Setting node power =================");
    log(res);
    log("================= Setting node power =================");
  } catch (error) {
    log("Error while setting node power " + error);
  }
}

async function main() {
  const grid3 = await getClient();

  const nodePower: NodePowerModel = {
    nodeId: 73,
    power: true,
  };

  //Set node power
  await setNodePower(grid3, nodePower);

  await grid3.disconnect();
}

main();
