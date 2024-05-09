import { FilterOptions, GatewayNameModel, MachinesModel } from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

async function deployVM(client, vms) {
  try {
    const res = await client.machines.deploy(vms);
    log("================= Deploying Mattermost =================");
    log(res);
    log("================= Deploying Mattermost =================");
    return res;
  } catch (error) {
    log("Error while Deploying the VM " + error);
  }
}

async function deployGateway(client, gw) {
  try {
    const res = await client.gateway.deploy_name(gw);
    log("================= Deploying name gateway =================");
    log(res);
    log("================= Deploying name gateway =================");
    return res;
  } catch (error) {
    log("Error deploying gateway " + error);
  }
}

async function getDeployment(client, vms, gatewayName) {
  try {
    const res = await client.machines.getObj(vms);
    log("================= Getting VM deployment information =================");
    log(res);
    log(`You can access Mattermost via the browser using: http://${gatewayName}.yourdomain.com`);
    log("================= Getting VM deployment information =================");
  } catch (error) {
    log("Error while getting the deployment " + error);
  }
}

async function cancelDeployment(client, vms) {
  try {
    const res = await client.machines.delete(vms);
    log("================= Canceling the deployment =================");
    log(res);
    log("================= Canceling the deployment =================");
  } catch (error) {
    log("Error while canceling the deployment " + error);
  }
}

async function main() {
  const grid3 = await getClient();

  const vmQueryOptions: FilterOptions = {
    cru: 4,
    mru: 4, // GB
    sru: 10,
    farmId: 1,
  };

  const vms: MachinesModel = {
    name: "newVMS5",
    network: {
      name: "wedtest",
      ip_range: "10.249.0.0/16",
    },
    machines: [
      {
        name: "testvm",
        node_id: +(await grid3.capacity.filterNodes(vmQueryOptions))[0].nodeId,
        disks: [
          {
            name: "wedDisk",
            size: 8,
            mountpoint: "/var/lib/docker",
          },
        ],
        public_ip: true,
        public_ip6: false,
        planetary: false,
        mycelium: true,
        cpu: 4,
        memory: 1024 * 4,
        rootfs_size: 0,
        flist: "https://hub.grid.tf/tf-official-apps/mattermost-latest.flist",
        entrypoint: "/sbin/zinit init",
        env: {
          SSH_KEY: config.ssh_key,
          MATTERMOST_DOMAIN: "gent02.dev.grid.tf",
          SITE_URL: "https://gent02.dev.grid.tf",
          DB_PASSWORD: "",
        },
      },
    ],
    metadata: "",
    description: "mattermost machine/node",
  };

  const vmDeployResult = await deployVM(grid3, vms);
  const publicIP = vmDeployResult.public_ip;

  const gatewayQueryOptions: FilterOptions = {
    gateway: true,
    farmId: 1,
  };

  const gw: GatewayNameModel = {
    name: "mattermost-gateway",
    node_id: +(await grid3.capacity.filterNodes(gatewayQueryOptions))[0].nodeId,
    tls_passthrough: false,
    backends: [`http://${publicIP}:80`],
  };

  const gatewayResult = await deployGateway(grid3, gw);

  //Deploy mattermost
  await deploy(grid3, vms);
  await deployGateway(grid3, gw);

  //Get the deployment
  await getDeployment(grid3, vms.name);
  await getDeployment(grid3, vms.name, gw.name);

  // Uncomment the lines below to cancel the deployments
  // await cancelDeployment(grid3, { name: "newVMS5" });
  // await cancelDeployment(grid3, { name: gw.name });

  await grid3.disconnect();
}

main();
