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
  n.name = "vmgpuNetwork";
  n.ip_range = "10.249.0.0/16";

  // create disk Object
  const disk = new DiskModel();
  disk.name = "vmgpuDisk";
  disk.size = 100;
  disk.mountpoint = "/testdisk";

  const vmQueryOptions: FilterOptions = {
    cru: 8,
    mru: 16, // GB
    sru: 1000,
    availableFor: grid3.twinId,
    hasGPU: true,
    rentedBy: grid3.twinId,
  };

  const nodes = await grid3.capacity.filterNodes(vmQueryOptions);
  if (nodes.length === 0) {
    throw Error(`Couldn't find a node satisfying these filter options: ${JSON.stringify(vmQueryOptions)}`);
  }
  const nodeId = +nodes[0].nodeId;

  // create vm node Object
  const vm = new MachineModel();
  vm.name = "vmgpu";
  vm.node_id = nodeId;
  vm.disks = [disk];
  vm.public_ip = false;
  vm.planetary = true;
  vm.cpu = 8;
  vm.memory = 1024 * 16;
  vm.rootfs_size = 0;
  vm.flist = "https://hub.grid.tf/tf-official-vms/ubuntu-22.04.flist";
  vm.entrypoint = "/";
  vm.env = {
    SSH_KEY: config.ssh_key,
  };
  let gpuList = await grid3.zos.getNodeGPUInfo({ nodeId: nodeId });
  gpuList = gpuList.filter(g => g.contract === 0);
  if (gpuList.length <= 0) {
    throw Error(`Couldn't find GPU card available on node ${nodeId}`);
  }
  vm.gpus = [gpuList[0].id]; // gpu card's id, you can check the available gpu from the dashboard

  // create VMs Object
  const vms = new MachinesModel();
  vms.name = "vmgpu";
  vms.network = n;
  vms.machines = [vm];
  vms.metadata = "";
  vms.description = "test deploying VM with GPU via ts grid3 client";

  //Deploy VMs
  await deploy(grid3, vms);

  //Get the deployment
  await getDeployment(grid3, vms.name);

  //Uncomment the line below to cancel the deployment
  // await cancel(grid3, { name: vms.name });

  await grid3.disconnect();
}

main();
