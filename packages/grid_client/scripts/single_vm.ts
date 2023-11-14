import { DiskModel, MachineModel, MachinesModel, NetworkModel } from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

// create network Object
const n = new NetworkModel();
n.name = "wedtest";
n.ip_range = "10.249.0.0/16";

// create disk Object
const disk = new DiskModel();
disk.name = "wedDisk";
disk.size = 8;
disk.mountpoint = "/testdisk";

// create vm node Object
const vm = new MachineModel();
vm.name = "testvm";
vm.node_id = 17;
vm.disks = [disk];
vm.public_ip = false;
vm.planetary = true;
vm.cpu = 1;
vm.memory = 1024 * 2;
vm.rootfs_size = 0;
vm.flist = "https://hub.grid.tf/tf-official-apps/base:latest.flist";
vm.entrypoint = "/sbin/zinit init";
vm.env = {
  SSH_KEY: config.ssh_key,
};
// vm.ip = "10.249.2.5" // create a machine with specific private ip

// create VMs Object
const vms = new MachinesModel();
vms.name = "newVMS";
vms.network = n;
vms.machines = [vm];
vms.metadata = "";
vms.description = "test deploying VMs via ts grid3 client";

async function deploy(client, vms) {
  try {
    const res = await client.machines.deploy(vms);
    log("================= Deploying VM =================");
    log(res);
    log("================= Deploying VM =================");
  } catch (error) {
    log("Error while Deploying the VM " + error);
  }
}

async function getDeployment(client, vms) {
  try {
    const res = await client.machines.getObj(vms);
    log("================= Getting deployment information =================");
    log(res);
    log("================= Getting deployment information =================");
  } catch (error) {
    log("Error while getting the deployment " + error);
  }
}

async function cancel(client, vms) {
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

  //Deploy VMs
  await deploy(grid3, vms);

  //Get the deployment
  await getDeployment(grid3, vms.name);

  //Uncomment the line below to cancel the deployment
  // await cancel(grid3, { name: vms.name });

  await grid3.disconnect();
}

main();
