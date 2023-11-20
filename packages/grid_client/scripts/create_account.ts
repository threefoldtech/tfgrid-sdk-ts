import { env } from "process";
import { default as urlParser } from "url-parse";

import { GridClient } from "../src";
import { NetworkEnv } from "../src/config";
import config from "./config.json";
import { log } from "./utils";

async function createAccount(client, relay) {
  try {
    const res = await client.tfchain.createAccount(relay, true);
    log("================= Creating account =================");
    log(res);
    log("================= Creating account =================");
  } catch (error) {
    log("Error while creating account " + error);
  }
}

async function main() {
  let network;

  if (env.NETWORK) {
    network = env.NETWORK as NetworkEnv;
  } else {
    network = config.network as NetworkEnv;
  }

  const client = new GridClient({ mnemonic: "", network, storeSecret: "test" });
  client._connect();

  const urls = client.getDefaultUrls(network);
  const relay = urlParser(urls.relay).hostname;

  //Create Account
  await createAccount(client, relay);
}

main();
