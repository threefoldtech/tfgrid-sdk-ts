import { DiskModel, FilterOptions, MachineModel, MachinesModel, NetworkModel } from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

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
  vm.name = "testvm";
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
    PUBLIC_KEY: config.ssh_key,
    SWM_NODE_MODE: "leader",
    CAPROVER_ROOT_DOMAIN: "rafy.grid.tf", // update me
    DEFAULT_PASSWORD: "captain42",
    CAPTAIN_IMAGE_VERSION: "latest",
  };

  // create VMs Object
  const vms = new MachinesModel();
  vms.name = "newVMS5";
  vms.network = n;
  vms.machines = [vm];
  vms.metadata = "";
  vms.description = "caprover leader machine/node";

  //Deploy Caprover cluster
  await deploy(grid3, vms);

  //Get the deployment
  await getDeployment(grid3, vms.name, vm);

  //Uncomment the line below to cancel the deployment
  // await cancel(grid3, { name: vms.name });

  await grid3.disconnect();
}

async function deploy(client, vms) {
  try {
    const res = await client.machines.deploy(vms);
    log("================= Deploying Caprover cluster =================");
    log(res);
    log("================= Deploying Caprover cluster =================");
  } catch (error) {
    log("Error while Deploying the VM " + error);
  }
}

async function getDeployment(client, vms, vm) {
  try {
    const res = await client.machines.getObj(vms);
    log("================= Getting deployment information =================");
    log(res);
    log(`You can access Caprover via the browser using: http://captain.${vm.env.CAPROVER_ROOT_DOMAIN}`);
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

main();
