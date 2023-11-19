import { BlockchainGetModel } from "../../src";
import { getClient } from "../client_loader";
import { log } from "../utils";

async function getBalanceByName(client, account) {
  try {
    const res = await client.tfchain.assets(account);
    log("================= Getting balance =================");
    log(res);
    log("================= Getting balance =================");
  } catch (error) {
    log("Error while getting balance" + error);
  }
}

async function main() {
  const grid3 = await getClient();
  const account: BlockchainGetModel = {
    name: "newacc",
  };

  //Get balance by account name
  await getBalanceByName(grid3, account);

  await grid3.disconnect();
}

main();
