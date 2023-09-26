import { getClient } from "./client_loader";

async function main() {
  const grid3 = await getClient();

  await grid3.farms.create({ name: "test-farm" });
  const farms = await grid3.capacity.getUserFarms({ twinId: 89 });
  console.log(farms);

  await grid3.disconnect();
}

main();
