import { getClient } from "./client_loader";
import { log } from "./utils";

async function deleteAllContracts(client) {
  try {
    const res = await client.contracts.cancelMyContracts();
    log("================= Deleting all contracts =================");
    log(res);
    log("================= Deleting all contracts =================");
  } catch (error) {
    console.error("Error while deleting contracts ", error.message);
  }
}

async function main() {
  const grid3 = await getClient();

  //Delete all contracts
  await deleteAllContracts(grid3);

  await grid3.disconnect();
}

main();
