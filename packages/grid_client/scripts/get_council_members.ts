import { getClient } from "./client_loader";

async function main() {
  const grid3 = await getClient();
  const members = await grid3.councilMembership.members();
  console.log(members);
  await grid3.disconnect();
}

main();
