import { FilterOptions, GatewayFQDNModel } from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function deploy(client, gw) {
  try {
    const res = await client.gateway.deploy_fqdn(gw);
    log("================= Deploying FQDN gateway =================");
    log(res);
    log("================= Deploying FQDN gateway =================");
  } catch (error) {
    log("Error while Deploying the gateway " + error);
  }
}

async function getDeployment(client, gw) {
  try {
    const res = await client.gateway.getObj(gw);
    log("================= Getting deployment information =================");
    log(res);
    log("================= Getting deployment information =================");
  } catch (error) {
    log("Error while getting the deployment " + error);
  }
}

async function cancel(client, gw) {
  try {
    const res = await client.gateway.delete_fqdn(gw);
    log("================= Canceling the deployment =================");
    log(res);
    log("================= Canceling the deployment =================");
  } catch (error) {
    log("Error while canceling the deployment " + error);
  }
}

// read more about the gateway types in this doc: https://github.com/threefoldtech/zos/tree/main/docs/internals/gateway
async function main() {
  const grid3 = await getClient();

  const gatewayQueryOptions: FilterOptions = {
    gateway: true,
    farmId: 1,
  };

  const gw: GatewayFQDNModel = {
    name: "applyFQDN",
    node_id: +(await grid3.capacity.filterNodes(gatewayQueryOptions))[0].nodeId,
    fqdn: "test.hamada.grid.tf",
    tls_passthrough: false,
    // the backends have to be in this format `http://ip:port` or `https://ip:port`, and the `ip` pingable from the node so using the ygg ip or public ip if available.
    backends: ["http://185.206.122.35:8000"],
  };

  //Deploy VMs
  await deploy(grid3, gw);

  //Get the deployment
  await getDeployment(grid3, gw.name);

  //Uncomment the line below to cancel the deployment
  // await cancel(grid3, { name: gw.name });

  grid3.disconnect();
}

main();
