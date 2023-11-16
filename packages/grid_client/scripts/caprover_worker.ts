import { DiskModel, FilterOptions, MachineModel, MachinesModel, NetworkModel } from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

async function deploy(client, vms) {
  try {
    const res = await client.machines.deploy(vms);
    log("================= Deploying Worker =================");
    log(res);
    log("================= Deploying Worker =================");
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

  const vmQueryOptions: FilterOptions = {
    cru: 4,
    mru: 4, // GB
    sru: 10,
    farmId: 1,
  };

  const CAPROVER_FLIST = "https://hub.grid.tf/tf-official-apps/tf-caprover-latest.flist";
  // create network Object
  const n = new NetworkModel();
  n.name = "wedtest";
  n.ip_range = "10.249.0.0/16";

  // create disk Object
  const disk = new DiskModel();
  disk.name = "wedDisk";
  disk.size = 10;
  disk.mountpoint = "/var/lib/docker";

  // create vm node Object
  const vm = new MachineModel();
  vm.name = "capworker1";
  vm.node_id = +(await grid3.capacity.filterNodes(vmQueryOptions))[0].nodeId;
  vm.disks = [disk];
  vm.public_ip = true;
  vm.planetary = false;
  vm.cpu = 4;
  vm.memory = 1024 * 4;
  vm.rootfs_size = 0;
  vm.flist = CAPROVER_FLIST;
  vm.entrypoint = "/sbin/zinit init";
  vm.env = {
    // These env. vars needed to be changed based on the leader node.
    PUBLIC_KEY: config.ssh_key,
    SWM_NODE_MODE: "worker",
    LEADER_PUBLIC_IP: "185.206.122.157",
    CAPTAIN_IMAGE_VERSION: "latest",
  };

  // create VMs Object
  const vms = new MachinesModel();
  vms.name = "newVMS6";
  vms.network = n;
  vms.machines = [vm];
  vms.metadata = "";
  vms.description = "caprover worker machine/node";

  //Deploy Caprover worker
  await deploy(grid3, vms);

  //Get the deployment
  await getDeployment(grid3, vms.name);

  //Uncomment the line below to cancel the deployment
  // await cancel(grid3, { name: vms.name });

  await grid3.disconnect();
}

main();
