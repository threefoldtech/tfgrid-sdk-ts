import { DiskModel, FilterOptions, MachineModel, MachinesModel, NetworkModel } from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

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

  // deploy vms
  const res = await grid3.machines.deploy(vms);
  log(res);

  // get the deployment
  const l = await grid3.machines.getObj(vms.name);
  log(l);

  // // delete
  // const d = await grid3.machines.delete({ name: vms.name });
  // log(d);

  await grid3.disconnect();
}

main();
