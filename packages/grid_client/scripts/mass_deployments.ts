import {
  FarmFilterOptions,
  FilterOptions,
  generateString,
  GridClient,
  MachineModel,
  MachinesModel,
  NetworkModel,
  TwinDeployment,
} from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

async function pingNodes(grid3: GridClient, nodes: any[]): Promise<any[]> {
  const pingPromises = nodes.map(async node => {
    try {
      const res = await grid3.zos.pingNode({ nodeId: node.nodeId });
      return { node, res };
    } catch (error) {
      return { node, error };
    }
  });

  const results = await Promise.all(pingPromises);
  return results;
}

async function main() {
  const grid3 = await getClient();

  // Timeout for deploying vm is 2 min
  grid3.clientOptions.deploymentTimeoutMinutes = 2;
  await grid3.connect();

  const errors: any = [];
  const offlineNodes: number[] = [];
  let failedCount = 0;
  let successCount = 0;
  const batchSize = 50;
  const totalVMs = 250;
  const batches = totalVMs / batchSize;

  // resources
  const cru = 1;
  const mru = 256;
  const rootFs = 1;
  const publicIp = false;

  console.time("Farms Time");
  const farms = await grid3.capacity.filterFarms({
    nodeMRU: mru / 1024,
    nodeSRU: rootFs,
    publicIp: publicIp,
    availableFor: await grid3.twins.get_my_twin_id(),
    randomize: true,
  } as FarmFilterOptions);
  console.timeEnd("Farms Time");

  if (farms.length < 1) {
    throw new Error("No farms found");
  }

  console.time("Total Deployment Time");

  for (let batch = 0; batch < batches; batch++) {
    console.time("Batch " + (batch + 1));

    const nodesPromises = Array.from({ length: batchSize }, async () => {
      const farmIds = farms.map(farm => farm.farmId);
      return grid3.capacity.filterNodes({
        cru: cru,
        mru: mru / 1024,
        sru: rootFs,
        availableFor: await grid3.twins.get_my_twin_id(),
        farmIds: farmIds,
        randomize: true,
      } as FilterOptions);
    });

    const nodes = await Promise.all(nodesPromises);

    let flattenedNodes = nodes.flat();

    console.time("Ping Nodes");
    try {
      const results = await pingNodes(grid3, flattenedNodes);
      results.forEach(({ node, res, error }) => {
        if (res) {
          console.log(`Node ${node.nodeId} is online`);
        } else {
          offlineNodes.push(node.nodeId);
          console.log(`Node ${node.nodeId} is offline`);
          if (error) {
            console.error("Error:", error);
          }
        }
      });
    } catch (error) {
      console.error("Error pinging nodes:", error);
    } finally {
      console.timeEnd("Ping Nodes");
    }

    flattenedNodes = flattenedNodes.filter(node => !offlineNodes.includes(node.nodeId));

    // Batch Deployment
    const batchVMs: MachinesModel[] = [];
    for (let i = 0; i < batchSize; i++) {
      const vmName = "vm" + generateString(8);

      if (flattenedNodes.length < 0) {
        errors.push("No online nodes available for deployment");
        failedCount++;
        continue;
      }

      const selectedNode = flattenedNodes.pop();

      // create vm node Object
      const vm = new MachineModel();
      vm.name = vmName;
      vm.node_id = selectedNode.nodeId;
      vm.disks = [];
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

      // create network model for each vm
      const n = new NetworkModel();
      n.name = "nw" + generateString(5);
      n.ip_range = "10.238.0.0/16";
      n.addAccess = true;

      // create VMs Object for each vm
      const vms = new MachinesModel();
      vms.name = "batch" + (batch + 1);
      vms.network = n;
      vms.machines = [vm];
      vms.metadata = "";
      vms.description = "Test deploying vm with name " + vm.name + " via ts grid3 client - Batch " + (batch + 1);

      batchVMs.push(vms);
    }

    const allTwinDeployments: TwinDeployment[] = [];

    const deploymentPromises = batchVMs.map(async (vms, index) => {
      try {
        const [twinDeployments, _, __] = await grid3.machines._createDeployment(vms);
        return { twinDeployments, batchIndex: index };
      } catch (error) {
        log(`Error creating deployment for batch ${batch + 1}: ${error}`);
        return { twinDeployments: null, batchIndex: index };
      }
    });
    console.time("Preparing Batch " + (batch + 1));
    const deploymentResults = await Promise.all(deploymentPromises);
    console.timeEnd("Preparing Batch " + (batch + 1));

    for (const { twinDeployments } of deploymentResults) {
      if (twinDeployments) {
        allTwinDeployments.push(...twinDeployments);
      }
    }

    try {
      await grid3.machines.twinDeploymentHandler.handle(allTwinDeployments);
      successCount += batchSize;
      log(`Successfully handled and saved contracts for all twin deployments`);
    } catch (error) {
      failedCount += batchSize;
      errors.push(error);
      log(`Error handling contracts for all twin deployments: ${error}`);
    }

    console.timeEnd("Batch " + (batch + 1));
  }

  console.timeEnd("Total Deployment Time");

  log("Successful Deployments: " + successCount);
  log("Failed Deployments: " + failedCount);

  // List of failed deployments' errors
  log("Failed deployments errors: ");
  for (let i = 0; i < errors.length; i++) {
    log(errors[i]);
    log("---------------------------------------------");
  }

  // List of offline nodes
  log("Failed Nodes: ");
  for (let i = 0; i < offlineNodes.length; i++) {
    log(offlineNodes[i]);
    log("---------------------------------------------");
  }

  await grid3.disconnect();
}

main();
