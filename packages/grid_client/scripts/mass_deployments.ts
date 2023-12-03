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
import { config, getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
  const grid3 = await getClient();

  const errors: any = [];
  let failedCount = 0;
  let successCount = 0;
  const batchSize = 5;
  const totalVMs = 50;
  const batches = totalVMs / batchSize;

  console.time("Total Deployment Time");

  for (let i = 0; i < batches; i++) {
    console.time("Batch " + (i + 1));

    const batchVMs: MachineModel[] = [];

    for (let i = 0; i < batchSize; i++) {
      const cru = 1;
      const mru = 256;
      const diskSize = 1;
      const rootFs = 1;
      const vmName = "vm" + generateString(8);
      const publicIp = false;

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
        availableFor: await grid3.twins.get_my_twin_id(),
        randomize: true,
      } as FarmFilterOptions);

      if (farms.length < 1) {
        throw new Error("No farms found");
      }
      //Node Selection
      const nodes = await grid3.capacity.filterNodes({
        cru: cru,
        mru: mru / 1024,
        sru: rootFs + diskSize,
        availableFor: await grid3.twins.get_my_twin_id(),
        farmId: +randomChoice(farms).farmId,
        randomize: true,
      } as FilterOptions);

      if (nodes.length < 1) {
        errors.push("Node not found");
        failedCount++;
        continue;
      }

      // create vm node Object
      const vm = new MachineModel();
      vm.name = vmName;
      vm.node_id = nodes[0].nodeId;
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

      batchVMs.push(vm);
    }
    // create network model for whole batch
    const n = new NetworkModel();
    n.name = "nw" + generateString(5);
    n.ip_range = "10.238.0.0/16";
    n.addAccess = true;

    // create VMs Object
    const vms = new MachinesModel();
    vms.name = "batch" + (i + 1);
    vms.network = n;
    vms.machines = batchVMs;
    vms.metadata = "";
    vms.description = "Test deploying VMs via ts grid3 client - Batch " + (i + 1);

    // deploy vm
    try {
      await grid3.machines.deploy(vms);
      successCount += batchSize;
    } catch (error) {
      log(error);
      errors.push(error);
      failedCount += batchSize;
      continue;
    } finally {
      console.timeEnd("Batch " + (i + 1));
    }
  }

  console.timeEnd("Total Deployment Time");

  log("Successful Deployments: " + successCount);
  log("Failed Deployments: " + failedCount);

  // List of failed deployments errors
  log("Failed deployments errors: ");
  for (let i = 0; i < errors.length; i++) {
    log(errors[i]);
    log("---------------------------------------------");
  }

  await grid3.disconnect();
}

main();
