import { FilterOptions, GatewayNameModel, MachinesModel } from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

async function deployVM(client, vms) {
  const res = await client.machines.deploy(vms);
  log("================= Deploying VM =================");
  log(res);
  log("================= Deploying VM =================");
  return res;
}

async function deployGateway(client, gw) {
  const res = await client.gateway.deploy_name(gw);
  log("================= Deploying name gateway =================");
  log(res);
  log("================= Deploying name gateway =================");
}

async function getDeployment(client, vms) {
  const res = await client.machines.getObj(vms);
  log("================= Getting VM deployment information =================");
  log(res);
  log("================= Getting VM deployment information =================");
}

async function cancelDeployment(client, vms) {
  const res = await client.machines.delete(vms);
  log("================= Canceling the VM deployment =================");
  log(res);
  log("================= Canceling the VM deployment =================");
}

async function main() {
  const grid3 = await getClient();

  const vms: MachinesModel = {
    name: "newVMS21",
    network: {
      name: "wedtest21",
      ip_range: "10.249.0.0/16",
    },
    machines: [
      {
        name: "testvm21",
        node_id: 144,
        disks: [
          {
            name: "wedDisk1",
            size: 8,
            mountpoint: "/var/lib/docker",
          },
        ],
        public_ip: false,
        public_ip6: true,
        planetary: true,
        mycelium: false,
        cpu: 1,
        memory: 1024 * 2,
        rootfs_size: 2,
        flist: "https://hub.grid.tf/tf-official-apps/tf-wordpress-latest.flist",
        entrypoint: "/sbin/zinit init",
        env: {
          SSH_KEY: config.ssh_key,
        },
      },
    ],
    metadata: "",
    description: "nodepilot machine",
  };

  const vmDeployResult = await deployVM(grid3, vms);
  const publicIP = vmDeployResult.public_ip;

  const gatewayQueryOptions: FilterOptions = {
    gateway: true,
    farmId: 1,
  };

  const gw: GatewayNameModel = {
    name: "testgateway1",
    node_id: +(await grid3.capacity.filterNodes(gatewayQueryOptions))[0].nodeId,
    tls_passthrough: false,
    backends: ["http://185.206.122.35:8000"],
  };

  //Deploy nodepilot
  await deploy(grid3, vms);
  await deployGateway(grid3, gw);

  //Get the deployment
  await getDeployment(grid3, vms.name);
  await getDeployment(grid3, vms.name, gw.name);

  // Uncomment the lines below to cancel the deployments
  // await cancelDeployment(grid3, { name: "newVMS2" });
  // await cancelDeployment(grid3, { name: gw.name });

  await grid3.disconnect();
}

main();
