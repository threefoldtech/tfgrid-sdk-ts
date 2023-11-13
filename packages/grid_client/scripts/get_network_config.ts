import { getClient } from "./client_loader";
import { log } from "./utils";

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

async function listNetworks(client) {
  try {
    const res = await client.networks.list();
    log("================= Listing Networks =================");
    log(res);
    log("================= Listing Networks =================");
  } catch (error) {
    log("Error while listing networks " + error);
  }
}

async function getNetworkConfig(client, networkName) {
  try {
    const res = await client.networks.getWireGuardConfigs({ name: networkName });
    log("================= Getting network config =================");
    log(res);
    log("================= Getting network config =================");
  } catch (error) {
    log("Error while getting network config " + error);
  }
}

main();
