import { getClient } from "./client_loader";
import { log } from "./utils";

async function getProposals(client) {
  const res = await client.dao.get();
  log("================= Getting proposals =================");
  log(res);
  log("================= Getting proposals =================");
}

async function main() {
  const grid3 = await getClient();

  //Get proposals
  await getProposals(grid3);

  await grid3.disconnect();
}

main();
