import { TfchainWalletBalanceByAddressModel } from "../../src";
import { getClient } from "../client_loader";
import { log } from "../utils";

async function getBalanceByAddress(client, address) {
  try {
    const res = await client.tfchain.balanceByAddress(address);
    log("================= Getting balance =================");
    log(res);
    log("================= Getting balance =================");
  } catch (error) {
    log("Error while getting balance" + error);
  }
}

async function main() {
  const grid3 = await getClient();
  const address: TfchainWalletBalanceByAddressModel = {
    address: "5FfAv7qUb3oa8TfdeLCEicirtdGvXHnV2owtsv5XNa9aDzEu",
  };

  //Get balance by address
  await getBalanceByAddress(grid3, address);

  await grid3.disconnect();
}

main();
