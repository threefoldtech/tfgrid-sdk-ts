import { getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
  const grid3 = await getClient();

  const node = { nodeId: 73 };

  const extraFee = 5;

  //Set extra fee
  await setExtraFee(grid3, node, extraFee);

  //Get extra fee
  await getExtraFee(grid3, node);

  await grid3.disconnect();
}

async function setExtraFee(client, node, extraFee) {
  try {
    const res = await client.contracts.setDedicatedNodeExtraFee({ ...node, extraFee: extraFee });
    log("================= Setting extra fee =================");
    log(res);
    log("================= Setting extra fee =================");
  } catch (error) {
    log("Error while setting extra fee " + error);
  }
}

async function getExtraFee(client, node) {
  try {
    const res = await client.contracts.getDedicatedNodeExtraFee(node);
    log("================= Getting extra fee =================");
    log(res);
    log("================= Getting extra fee =================");
  } catch (error) {
    log("Error while getting extra fee " + error);
  }
}

main();
