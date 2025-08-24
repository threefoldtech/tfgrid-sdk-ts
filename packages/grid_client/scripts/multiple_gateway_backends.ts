import { FilterOptions, GatewayNameModel } from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function deploy(client, gw) {
  const res = await client.gateway.deploy_name(gw);
  log("================= Deploying NAME gateway with multiple backends =================");
  log(res);
  log("================= Deploying NAME gateway with multiple backends =================");
}

async function getDeployment(client, gw) {
  const res = await client.gateway.getObj(gw);
  log("================= Getting deployment information =================");
  log(res);
  log("================= Getting deployment information =================");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function cancel(client, gw) {
  const res = await client.gateway.delete_name(gw);
  log("================= Canceling the deployment =================");
  log(res);
  log("================= Canceling the deployment =================");
}

async function main() {
  const grid3 = await getClient();

  const gatewayQueryOptions: FilterOptions = {
    gateway: true,
    farmId: 1,
  };

  const gw: GatewayNameModel = {
    name: "multibackends",
    node_id: +(await grid3.capacity.filterNodes(gatewayQueryOptions))[0].nodeId,
    tls_passthrough: false,
    // the backends have to be in this format `http://ip:port` or `https://ip:port`, and the `ip` pingable from the node so using the ygg ip or public ip if available.
    backends: ["http://185.206.122.17:8000", "http://185.206.122.22:8000", "http://185.206.122.35:8000"],
  };

  //Deploy Gateway
  await deploy(grid3, gw);

  //Get the deployment
  await getDeployment(grid3, gw.name);

  //Uncomment the line below to cancel the deployment
  // await cancel(grid3, { name: gw.name });

  grid3.disconnect();
}

main();
