import { TfchainWalletInitModel } from "../../src";
import { getClient } from "../client_loader";
import { log } from "../utils";

async function importAccount(client, account) {
  try {
    const res = await client.tfchain.init(account);
    log("================= Importing account =================");
    log(res);
    log("================= Importing account =================");
  } catch (error) {
    log("Error while importing account" + error);
  }
}

async function main() {
  const grid3 = await getClient();
  const account: TfchainWalletInitModel = {
    name: "newacc1",
    secret: grid3.clientOptions.mnemonic,
  };

  //Import Account
  await importAccount(grid3, account);

  await grid3.disconnect();
}

main();
