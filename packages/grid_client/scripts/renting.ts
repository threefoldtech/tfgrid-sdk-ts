import { getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
  const client = await getClient();

  async function unreserve() {
    const unreserved = await client.nodes.unreserve({ nodeId: 12 });
    log(unreserved);
  }

  const nodesDedicated = await client.capacity.filterNodes({ dedicated: true });
  log(nodesDedicated);

  const nodesAvailableFor = await client.capacity.filterNodes({ availableFor: client.twinId });
  log(nodesAvailableFor);

  const reserved = await client.nodes.reserve({ nodeId: 22 });
  log(reserved);

  const rentContractId = await client.nodes.getRentContractId({ nodeId: 12 });
  log(rentContractId);

  // Uncomment the line below if you intend to perform unreserve.
  // unreserve();
  await client.disconnect();
}

main();
