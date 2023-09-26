import { getClient } from "./client_loader";

async function main() {
  const grid3 = await getClient();

  await grid3.farms.create({ name: "test-farm" });

  await grid3.disconnect();
}

main();
