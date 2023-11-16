import { DiskModel, FilterOptions, MachineModel, MachinesModel, NetworkModel } from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

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

  // create network Object
  const n = new NetworkModel();
  n.name = "dynamictest";
  n.ip_range = "10.249.0.0/16";

  // create disk Object
  const disk = new DiskModel();
  disk.name = "dynamicDisk";
  disk.size = 1;
  disk.mountpoint = "/testdisk";

  const vmQueryOptions: FilterOptions = {
    cru: 1,
    mru: 1, // GB
    sru: 1,
    availableFor: grid3.twinId,
    country: "Belgium",
  };

  // create vm node Object
  const vm = new MachineModel();
  vm.name = "testvm";
  vm.node_id = +(await grid3.capacity.filterNodes(vmQueryOptions))[0].nodeId; // TODO: allow random choice
  vm.disks = [disk];
  vm.public_ip = false;
  vm.planetary = true;
  vm.cpu = 1;
  vm.memory = 1024;
  vm.rootfs_size = 0;
  vm.flist = "https://hub.grid.tf/tf-official-apps/base:latest.flist";
  vm.entrypoint = "/sbin/zinit init";
  vm.env = {
    SSH_KEY: config.ssh_key,
  };

  // create VMs Object
  const vms = new MachinesModel();
  vms.name = "dynamicVMS";
  vms.network = n;
  vms.machines = [vm];
  vms.metadata = "";
  vms.description = "test deploying VMs via ts grid3 client";

  //Deploy VMs
  await deploy(grid3, vms);

  //Get the deployment
  await getDeployment(grid3, vms.name);

  //Uncomment the line below to cancel the deployment
  // await cancel(grid3, { name: vms.name });

  await grid3.disconnect();
}

main();
