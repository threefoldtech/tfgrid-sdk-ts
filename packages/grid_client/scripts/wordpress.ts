import { FilterOptions, GatewayNameModel, MachinesModel } from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

async function deployVM(client, vms) {
  try {
    const res = await client.machines.deploy(vms);
    log("================= Deploying WordPress Machine =================");
    log(res);
    log("================= Deploying WordPress Machine =================");
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
  } catch (error) {
    log("Error deploying gateway " + error);
  }
}

async function getDeployment(client, vms) {
  try {
    const res = await client.machines.getObj(vms);
    log("================= Getting VM deployment information =================");
    log(res);
    log(`You can access WordPress via the browser using: http://newVMS5.${res[0].env.WP_URL}`);
    log("================= Getting VM deployment information =================");
    return res;
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
    mru: 4,
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
        flist: "https://hub.grid.tf/tf-official-apps/tf-wordpress-latest.flist",
        entrypoint: "/sbin/zinit init",
        env: {
          SSH_KEY: config.ssh_key,
          MYSQL_USER: "testtest",
          MYSQL_PASSWORD: "123456",
          ADMIN_EMAIL: "test@gmail.com",
          WP_URL: "newVMS5.yourdomain.com",
        },
      },
    ],
    metadata: "",
    description: "wordpress machine",
  };

  const vmDeployResult = await deployVM(grid3, vms);
  const publicIP = vmDeployResult.public_ip;

  const gatewayQueryOptions: FilterOptions = {
    gateway: true,
    farmId: 1,
  };

  const gw: GatewayNameModel = {
    name: "test-gateway",
    node_id: +(await grid3.capacity.filterNodes(gatewayQueryOptions))[0].nodeId,
    tls_passthrough: false,
    backends: [`http://${publicIP}:80`], // Using the VM's public IP as the backend
  };

  //Deploy wordpress
  await deploy(grid3, vms);
  await deployGateway(grid3, gw);

  //Get the deployment
  await getDeployment(grid3, vms.name);
  await getDeployment(grid3, vms.name, gw.name);

  // Uncomment the lines below to cancel the deployments
  // await cancelDeployment(grid3, { name: vms.name });
  // await cancelDeployment(grid3, { name: gw.name });

  await grid3.disconnect();
}

main();
