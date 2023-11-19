import { SetDedicatedNodeExtraFeesModel } from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function setExtraFee(client, extraFee) {
  try {
    const res = await client.contracts.setDedicatedNodeExtraFee(extraFee);
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

async function main() {
  const grid3 = await getClient();
  const node = 73;
  const extraFee = 5;
  const extraFeeModel: SetDedicatedNodeExtraFeesModel = {
    nodeId: node,
    extraFee: extraFee,
  };

  //Set extra fee
  await setExtraFee(grid3, extraFeeModel);

  //Get extra fee
  await getExtraFee(grid3, node);

  await grid3.disconnect();
}

main();
