import { FilterOptions, MachineModel, MachinesModel, NetworkModel } from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

const n = new NetworkModel();
n.name = "monNetwork";
n.ip_range = "10.238.0.0/16";
n.addAccess = true; // add wireguard access

const vm = new MachineModel();
vm.name = "testVM";
vm.public_ip = false;
vm.planetary = true;
vm.cpu = 1;
vm.memory = 1024 * 2;
vm.rootfs_size = 0;
vm.disks = [];
vm.flist = "https://hub.grid.tf/tf-official-apps/base:latest.flist";
vm.entrypoint = "/sbin/zinit init";
vm.env = {
  SSH_KEY: config.ssh_key,
};

// create VMs Object
const vms = new MachinesModel();
vms.name = "newVMS";
vms.network = n;
vms.machines = [vm];
vms.metadata = "";
vms.description = "test deploying VMs with wireguard via ts grid3 client";

async function main() {
  const grid3 = await getClient();

  const vmQueryOptions: FilterOptions = {
    cru: 1,
    mru: 2, // GB
    availableFor: grid3.twinId,
    farmId: 1,
  };

  const vmNode = +(await grid3.capacity.filterNodes(vmQueryOptions))[0].nodeId;
  vm.node_id = vmNode;

  // deploy vms
  const res = await grid3.machines.deploy(vms);
  log(res);

  // get the deployment
  const l = await grid3.machines.getObj(vms.name);
  log(l);

  // get wireguard configuration
  const wireguard = await grid3.networks.getWireGuardConfigs({ name: n.name });
  log("=== Wireguard configuration ===");
  log(wireguard[0]);

  // // delete
  const d = await grid3.machines.delete({ name: vms.name });
  log(d);

  await grid3.disconnect();
}

main();
