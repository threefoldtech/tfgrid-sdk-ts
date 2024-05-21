import { FilterOptions, GatewayNameModel, MachinesModel } from "../../src";
import { config, getClient } from "../client_loader";
import { log, pingNodes } from "../utils";

async function deploy(client, vms, subdomain, gatewayNode) {
  const resultVM = await client.machines.deploy(vms);
  log("================= Deploying VM =================");
  log(resultVM);
  log("================= Deploying VM =================");

  const vmPlanetary = (await client.machines.getObj(vms.name))[0].planetary;
  //Name Gateway Model
  const gw: GatewayNameModel = {
    name: subdomain,
    node_id: gatewayNode.nodeId,
    tls_passthrough: false,
    backends: ["http://[" + vmPlanetary + "]:80"],
  };

  const resultGateway = await client.gateway.deploy_name(gw);
  log("================= Deploying name gateway =================");
  log(resultGateway);
  log("================= Deploying name gateway =================");
}

async function getDeployment(client, vms, gw) {
  const resultVM = await client.machines.getObj(vms.name);
  const resultGateway = await client.gateway.getObj(gw);
  log("================= Getting deployment information =================");
  log(resultVM);
  log(resultGateway);
  log("https://" + resultGateway[0].domain);
  log("================= Getting deployment information =================");
}

async function cancel(client, vms, gw) {
  const resvm = await client.machines.delete(vms);
  const resgw = await client.gateway.delete_name(gw);
  log("================= Canceling the deployment =================");
  log(resvm);
  log(resgw);
  log("================= Canceling the deployment =================");
}

async function main() {
  const name = "newcasperlabs";
  const grid3 = await getClient(`casperlabs/${name}`);
  const subdomain = "cl" + grid3.twinId + name;

  //VMNode Selection
  const vmQueryOptions: FilterOptions = {
    cru: 2,
    mru: 4,
    sru: 100,
    availableFor: grid3.twinId,
    farmId: 1,
  };
  //GatewayNode Selection
  const gatewayQueryOptions: FilterOptions = {
    gateway: true,
    availableFor: grid3.twinId,
  };
  const gatewayNode = (await grid3.capacity.filterNodes(gatewayQueryOptions))[0];

  const vms: MachinesModel = {
    name,
    network: {
      name: "wedtest",
      ip_range: "10.249.0.0/16",
    },
    machines: [
      {
        name: "casperlabs",
        node_id: +(await pingNodes(grid3, await grid3.capacity.filterNodes(vmQueryOptions))),
        disks: [
          {
            name: "wedDisk",
            size: 100,
            mountpoint: "/data",
          },
        ],
        planetary: true,
        public_ip: false,
        public_ip6: false,
        mycelium: false,
        cpu: 2,
        memory: 1024 * 4,
        rootfs_size: 0,
        flist: "https://hub.grid.tf/tf-official-apps/casperlabs-latest.flist",
        entrypoint: "/sbin/zinit init",
        env: {
          SSH_KEY: config.ssh_key,
          CASPERLABS_HOSTNAME: subdomain + "." + gatewayNode.publicConfig.domain,
        },
      },
    ],
    metadata: "",
    description: "test deploying CasberLabs via ts grid3 client",
  };

  //Deploy VMs
  await deploy(grid3, vms, subdomain, gatewayNode);

  //Get the deployment
  await getDeployment(grid3, vms, subdomain);

  //Uncomment the line below to cancel the deployment
  // await cancel(grid3, { name }, { name: subdomain });

  await grid3.disconnect();
}

main();
