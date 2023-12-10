import { default as urlParser } from "url-parse";

import { TfchainCreateModel } from "../../src";
import { getClient } from "../client_loader";
import { log } from "../utils";

async function createAccount(client, account) {
  try {
    const res = await client.tfchain.create(account);
    log("================= Creating account =================");
    log(res);
    log("================= Creating account =================");
  } catch (error) {
    log("Error while creating account" + error);
  }
}

async function main() {
  const grid3 = await getClient();
  const urls = grid3.getDefaultUrls(grid3.clientOptions.network);
  const relay = urlParser(urls.relay).hostname;
  const account: TfchainCreateModel = {
    relay: relay,
    name: "newacc",
  };

  //Create Account
  await createAccount(grid3, account);

  await grid3.disconnect();
}

main();
