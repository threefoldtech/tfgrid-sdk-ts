import { getClient } from "./client_loader";

async function main() {
  const grid3 = await getClient();
  const proposals = await grid3.dao.get();
  console.log(proposals);
  await grid3.disconnect();
}

main();
