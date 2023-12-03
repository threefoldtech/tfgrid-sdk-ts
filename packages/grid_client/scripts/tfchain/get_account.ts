import { BlockchainGetModel } from "../../src";
import { getClient } from "../client_loader";
import { log } from "../utils";

async function getAccount(client, account) {
  try {
    const res = await client.tfchain.get(account);
    log("================= Getting account =================");
    log(res);
    log("================= Getting account =================");
  } catch (error) {
    log("Error while getting account" + error);
  }
}

async function main() {
  const grid3 = await getClient();
  const account: BlockchainGetModel = {
    name: "newacc",
  };

  //Get Account
  await getAccount(grid3, account);

  await grid3.disconnect();
}

main();
