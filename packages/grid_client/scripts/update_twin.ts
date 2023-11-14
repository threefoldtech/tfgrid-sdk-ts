import { getClient } from "./client_loader";
import { log } from "./utils";

async function updateTwin(client, relay) {
  try {
    const res = await client.twins.update(relay);
    log("================= Updating twin =================");
    log(res);
    log("================= Updating twin =================");
  } catch (error) {
    log("Error while updating twin " + error);
  }
}

async function main() {
  const grid3 = await getClient();

  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain, @typescript-eslint/no-non-null-assertion
  const urls = grid3.getDefaultUrls(grid3.clientOptions?.network!);
  const relay = urls.relay.slice(6);

  //Update twin
  await updateTwin(grid3, { relay });

  grid3.disconnect();
}

main();
