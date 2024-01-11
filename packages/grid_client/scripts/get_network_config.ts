import { getClient } from "./client_loader";
import { log } from "./utils";

async function listNetworks(client) {
  const res = await client.networks.list();
  log("================= Listing Networks =================");
  log(res);
  log("================= Listing Networks =================");
}

async function getNetworkConfig(client, networkName) {
  const res = await client.networks.getWireGuardConfigs({ name: networkName });
  log("================= Getting network config =================");
  log(res);
  log("================= Getting network config =================");
}

async function main() {
  const grid3 = await getClient();
  const networkName = "test";

  //List networks
  await listNetworks(grid3);

  // to have value returned from this method,
  // a machine or k8s should be deployed with 'addAccess' enabled in the network object.
  await getNetworkConfig(grid3, networkName);

  await grid3.disconnect();
}

main();
