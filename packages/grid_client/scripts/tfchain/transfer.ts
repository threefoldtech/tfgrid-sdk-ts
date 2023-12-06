import { TfchainWalletTransferModel } from "../../src";
import { getClient } from "../client_loader";
import { log } from "../utils";

async function transfer(client, transfer) {
  try {
    const res = await client.tfchain.pay(transfer);
    log("================= Transferring funds =================");
    log(res);
    log("================= Transferring funds =================");
  } catch (error) {
    log("Error while transferring funds " + error);
  }
}

async function main() {
  const grid3 = await getClient();
  const target_address = "5F7ctVSmDXMM3yTQszZy47QgvNxaeUPPRz5p3oBaK9jTeNgf";
  const transferInfo: TfchainWalletTransferModel = {
    name: "newacc",
    address_dest: target_address,
    amount: 100,
  };

  //transfer
  await transfer(grid3, transferInfo);

  await grid3.disconnect();
}

main();
