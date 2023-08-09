import { getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
  const client = await getClient();

  const nodesDedicated = await client.capacity.filterNodes({ dedicated: true });
  log(nodesDedicated);

  const nodesAvailableFor = await client.capacity.filterNodes({ availableFor: client.twinId });
  log(nodesAvailableFor);

  const reserved = await client.nodes.reserve({ nodeId: 22 });
  log(reserved);

  const rentContractId = await client.nodes.getRentContractId({ nodeId: 12 });
  log(rentContractId);

  const unreserved = await client.nodes.unreserve({ nodeId: 12 });
  log(unreserved);

  await client.disconnect();
}

main();
