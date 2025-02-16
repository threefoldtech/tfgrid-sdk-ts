import { generateString, TfchainWalletInitModel } from "../../src";
import { getClient } from "../client_loader";
import { log } from "../utils";

async function importAccount(client, account) {
  const res = await client.tfchain.init(account);
  log("================= Importing account =================");
  log(res);
  log("================= Importing account =================");
}

async function main() {
  const grid3 = await getClient();
  const name = generateString(10);

  const account: TfchainWalletInitModel = {
    name: name,
    secret: grid3.clientOptions.mnemonic,
  };

  //Import Account
  await importAccount(grid3, account);

  await grid3.disconnect();
}

main();
