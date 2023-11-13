import { getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
  const grid3 = await getClient();
  const contractId = 1834;

  //Get Deletion time
  await getDeletionTime(grid3, contractId);

  await grid3.disconnect();
}

async function getDeletionTime(client, contractId) {
  try {
    const res = await client.contracts.getDeletionTime({ id: contractId });
    log("================= Getting deletion time =================");
    log(res);
    log("================= Getting deletion time =================");
  } catch (error) {
    log("Error while getting deletion time " + error);
  }
}

main();
