import { BlockchainGetModel, generateString } from "../../src";
import { getClient } from "../client_loader";
import { log } from "../utils";

async function getAccount(client, account) {
  const res = await client.tfchain.get(account);
  log("================= Getting account =================");
  log(res);
  log("================= Getting account =================");
}

async function main() {
  const grid3 = await getClient();
  const name = generateString(10);
  const account: BlockchainGetModel = {
    name: name,
  };

  //Get Account
  await getAccount(grid3, account);

  await grid3.disconnect();
}

main();
