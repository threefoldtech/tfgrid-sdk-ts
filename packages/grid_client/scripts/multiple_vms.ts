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
  n.name = "monNetwork";
  n.ip_range = "10.238.0.0/16";

  // create disk Object
  const disk1 = new DiskModel();
  disk1.name = "newDisk1";
  disk1.size = 1;
  disk1.mountpoint = "/newDisk1";

  const vmQueryOptions: FilterOptions = {
    cru: 1,
    mru: 1, // GB
    sru: 1,
    availableFor: grid3.twinId,
    farmId: 1,
  };

  // create vm node Object
  const vm1 = new MachineModel();
  vm1.name = "testvm1";
  vm1.node_id = +(await grid3.capacity.filterNodes(vmQueryOptions))[0].nodeId;
  vm1.disks = [disk1];
  vm1.public_ip = false;
  vm1.planetary = true;
  vm1.cpu = 1;
  vm1.memory = 1024;
  vm1.rootfs_size = 0;
  vm1.flist = "https://hub.grid.tf/tf-official-apps/base:latest.flist";
  vm1.entrypoint = "/sbin/zinit init";
  vm1.env = {
    SSH_KEY: config.ssh_key,
  };

  // create disk Object
  const disk2 = new DiskModel();
  disk2.name = "newDisk2";
  disk2.size = 1;
  disk2.mountpoint = "/newDisk2";

  // create another vm node Object
  const vm2 = new MachineModel();
  vm2.name = "testvm2";
  vm2.node_id = +(await grid3.capacity.filterNodes(vmQueryOptions))[1].nodeId;
  vm2.disks = [disk2];
  vm2.public_ip = false;
  vm2.planetary = true;
  vm2.cpu = 1;
  vm2.memory = 1024;
  vm2.rootfs_size = 0;
  vm2.flist = "https://hub.grid.tf/tf-official-apps/base:latest.flist";
  vm2.entrypoint = "/sbin/zinit init";
  vm2.env = {
    SSH_KEY: config.ssh_key,
  };

  // create VMs Object
  const vms = new MachinesModel();
  vms.name = "monVMS";
  vms.network = n;
  vms.machines = [vm1, vm2];
  vms.metadata = "";
  vms.description = "test deploying VMs via ts grid3 client";

  //Deploy VMs
  await deploy(grid3, vms);

  //Get the deployment
  await getDeployment(grid3, vms.name);

  // //Uncomment the line below to cancel the deployment
  // await cancel(grid3, { name: vms.name });

  await grid3.disconnect();
}

main();
