import { getClient } from "./client_loader";
import { log } from "./utils";

async function listAllContracts(client) {
  try {
    const res = await client.contracts.listMyContracts();
    log("================= Listing all contracts =================");
    log(res);
    log("================= Listing all contracts =================");
  } catch (error) {
    log("Error while listing contracts " + error);
  }
}

async function main() {
  const grid3 = await getClient();

  //List all contracts
  await listAllContracts(grid3);

  await grid3.disconnect();
}

main();
