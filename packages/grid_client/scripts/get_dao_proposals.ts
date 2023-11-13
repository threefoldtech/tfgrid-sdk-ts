import { getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
  const grid3 = await getClient();
  // const proposals = await grid3.dao.get();
  // console.log(proposals);

  //Get proposals
  await getProposals(grid3);

  await grid3.disconnect();
}

async function getProposals(client) {
  try {
    const res = await client.dao.get();
    log("================= Getting proposals =================");
    log(res);
    log("================= Getting proposals =================");
  } catch (error) {
    log("Error while getting the proposals " + error);
  }
}

main();
