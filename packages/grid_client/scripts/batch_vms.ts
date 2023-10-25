import {
  DiskModel,
  FarmFilterOptions,
  FilterOptions,
  generateString,
  MachineModel,
  MachinesModel,
  NetworkModel,
  randomChoice,
} from "../src";
import { generateInt } from "../tests/utils";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
  const grid3 = await getClient();

  for (let i = 0; i < 2; i++) {
    //Generating the resources
    const cru = generateInt(1, 4);
    const mru = generateInt(256, 4096);
    const diskSize = generateInt(5, 25);
    const rootFs = generateInt(1, 5);
    const vmName = "vm" + generateString(8);
    const deploymentName = "dep" + generateString(8);
    let publicIp: number | boolean = generateInt(0, 1);
    publicIp = publicIp === 0 ? false : true;

    // create network Object
    const n = new NetworkModel();
    n.name = "nw" + generateString(5);
    n.ip_range = "10.238.0.0/16";

    // create disk Object
    const disk1 = new DiskModel();
    disk1.name = "d" + generateString(5);
    disk1.size = diskSize;
    disk1.mountpoint = "/newDisk1";

    //Farm Selection
    const farms = await grid3.capacity.filterFarms({
      nodeMRU: mru / 1024,
      nodeSRU: diskSize + rootFs,
      publicIp: publicIp,
    } as FarmFilterOptions);

    //Node Selection
    const nodes = await grid3.capacity.filterNodes({
      cru: cru,
      mru: mru / 1024,
      sru: rootFs + diskSize,
      availableFor: await grid3.twins.get_my_twin_id(),
      farmId: +randomChoice(farms).farmId,
    } as FilterOptions);

    const nodeId = +randomChoice(nodes).nodeId;

    // create vm node Object
    const vm = new MachineModel();
    vm.name = vmName;
    vm.node_id = nodeId;
    vm.disks = [disk1];
    vm.public_ip = publicIp;
    vm.planetary = true;
    vm.cpu = cru;
    vm.memory = mru;
    vm.rootfs_size = rootFs;
    vm.flist = "https://hub.grid.tf/tf-official-apps/base:latest.flist";
    vm.entrypoint = "/sbin/zinit init";
    vm.env = {
      SSH_KEY: config.ssh_key,
    };

    // create VMs Object
    const vms = new MachinesModel();
    vms.name = deploymentName;
    vms.network = n;
    vms.machines = [vm];
    vms.metadata = "";
    vms.description = "test deploying VMs via ts grid3 client";
    // deploy vms
    const res = await grid3.machines.deploy(vms);
    log(res);

    // get the deployment
    const l = await grid3.machines.getObj(vms.name);
    log(l);
  }

  await grid3.disconnect();
}

main();
