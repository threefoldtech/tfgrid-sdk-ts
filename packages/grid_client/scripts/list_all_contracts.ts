import { GridClient } from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function listAllContracts(client: GridClient) {
  const res = await client.contracts.getContractOverdueAmountById(158182);
  log("================= contract overdue in tft =================");
  log(res);
  log("================= contract overdue in tft =================");
}

async function main() {
  const grid3 = await getClient();

  //List all contracts
  await listAllContracts(grid3);

  await grid3.disconnect();
}

main();
