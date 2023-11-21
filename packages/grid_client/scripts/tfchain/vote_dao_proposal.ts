import { TfchainDaoVoteModel, TfchainWalletInitModel } from "../../src";
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

async function vote(client, vote) {
  try {
    const res = await client.tfchain.vote(vote);
    log("================= Voting =================");
    log(res);
    log("================= Voting =================");
  } catch (error) {
    log("Error while voting " + error);
  }
}

async function main() {
  const grid3 = await getClient();
  const account: TfchainWalletInitModel = {
    name: "harby",
    secret: grid3.clientOptions.mnemonic,
  };
  const voteInfo: TfchainDaoVoteModel = {
    name: "harby",
    address: "5FWW1F7XHaiRgPEqJdkv9nVgz94AVKXkTKNyfbLcY4rqpaNM",
    farmId: 246,
    hash: "0xa539b59dcf7ba10764a49c9effb88aea400d3c20f0071c3b85494423079757fe",
    approve: true,
  };

  //Import Account
  await importAccount(grid3, account);

  //Vote
  await vote(grid3, voteInfo);

  await grid3.disconnect();
}

main();
