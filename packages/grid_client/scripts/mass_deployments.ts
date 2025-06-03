import { Contract, ExtrinsicResult } from "@threefold/tfchain_client";
import { ValidationError } from "@threefold/types";

import {
  Deployment,
  DeploymentResultContracts,
  events,
  FarmFilterOptions,
  Features,
  FilterOptions,
  generateString,
  GridClient,
  KycStatus,
  MachineModel,
  MachinesModel,
  NetworkModel,
  NodeInfo,
  Operations,
  TwinDeployment,
  WorkloadTypes,
} from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

async function waitForDeployments(grid3: GridClient, twinDeployments: TwinDeployment[]) {
  const timeout = grid3.machines.twinDeploymentHandler.config.deploymentTimeoutMinutes;
  const results = await Promise.allSettled(
    twinDeployments.map(t => {
      if ([Operations.deploy, Operations.update].includes(t.operation)) {
        events.emit("logs", `Waiting for deployment with contract_id: ${t.deployment.contract_id} to be ready`);
        return grid3.machines.twinDeploymentHandler.waitForDeployment(t, timeout);
      }

      return null;
    }),
  );

  const passedDeployments: TwinDeployment[] = [];
  const failedDeployments: { twinDeployment: TwinDeployment; reason: any }[] = [];

  results.forEach((result, index) => {
    const twinDeployment = twinDeployments[index];
    if (result.status === "fulfilled") {
      passedDeployments.push(twinDeployment);
    } else {
      failedDeployments.push({
        twinDeployment,
        reason: result.reason,
      });
    }
  });

  return { passedDeployments, failedDeployments };
}

async function handle(grid3: GridClient, twinDeployments: TwinDeployment[]) {
  const kycStatus = await grid3.machines.twinDeploymentHandler.kyc.status();
  if (kycStatus !== KycStatus.verified)
    throw new ValidationError(
      "Your account is not verified. Please sign into Threefold Dashboard or Connect mobile app to complete your KYC verification.",
    );
  try {
    events.emit("logs", "Validating workloads");
    await grid3.machines.twinDeploymentHandler.validate(twinDeployments);
    await grid3.machines.twinDeploymentHandler.checkNodesCapacity(twinDeployments);
    await grid3.machines.twinDeploymentHandler.checkFarmIps(twinDeployments);
  } catch (error) {
    events.emit("logs", "Error Validating workloads:" + error);
  }

  const contracts: DeploymentResultContracts = {
    created: [],
    updated: [],
    deleted: [],
  };
  const resultContracts: DeploymentResultContracts = {
    created: [],
    updated: [],
    deleted: [],
  };
  let nodeExtrinsics: ExtrinsicResult<Contract>[] = [];
  let nameExtrinsics: ExtrinsicResult<Contract>[] = [];
  let deletedExtrinsics: ExtrinsicResult<number>[] = [];

  for (const twinDeployment of twinDeployments) {
    for (const workload of twinDeployment.deployment.workloads) {
      if (!twinDeployment.network) break;
      if (workload.type === WorkloadTypes.network || workload.type === WorkloadTypes.networklight) {
        events.emit("logs", `Updating network workload with name: ${workload.name}`);
        twinDeployment.network.updateWorkload(twinDeployment.nodeId, workload);
      }
    }

    const extrinsics = await grid3.machines.twinDeploymentHandler.PrepareExtrinsic(twinDeployment, contracts);
    nodeExtrinsics = nodeExtrinsics.concat(extrinsics.nodeExtrinsics);
    nameExtrinsics = nameExtrinsics.concat(extrinsics.nameExtrinsics);
    deletedExtrinsics = deletedExtrinsics.concat(extrinsics.deletedExtrinsics);
  }

  const extrinsicResults: Contract[] = await grid3.machines.twinDeploymentHandler.tfclient.applyAllExtrinsics<Contract>(
    [...nodeExtrinsics, ...nameExtrinsics],
  );

  for (const contract of extrinsicResults) {
    const updatedContract = contracts.updated.find(c => c["contractId"] === contract.contractId);
    if (!updatedContract) contracts.created.push(contract);
  }

  const successfulNodes = new Set<number>();
  const failedNodes = new Set<number>();
  for (const twinDeployment of twinDeployments) {
    try {
      if (twinDeployment.operation === Operations.deploy) {
        events.emit("logs", `Sending deployment to node_id: ${twinDeployment.nodeId}`);
        for (const contract of extrinsicResults) {
          if (twinDeployment.deployment.challenge_hash() === contract.contractType.nodeContract.deploymentHash) {
            twinDeployment.deployment.contract_id = contract.contractId;
            if (
              twinDeployment.returnNetworkContracts ||
              !(
                twinDeployment.deployment.workloads.length === 1 &&
                twinDeployment.deployment.workloads[0].type === WorkloadTypes.network
              )
            )
              resultContracts.created.push(contract);
            break;
          }
        }
        await grid3.machines.twinDeploymentHandler.sendToNode(twinDeployment);
        events.emit(
          "logs",
          `A deployment has been created on node_id: ${twinDeployment.nodeId} with contract_id: ${twinDeployment.deployment.contract_id}`,
        );
      } else if (twinDeployment.operation === Operations.update) {
        events.emit("logs", `Updating deployment with contract_id: ${twinDeployment.deployment.contract_id}`);
        for (const contract of extrinsicResults) {
          if (twinDeployment.deployment.challenge_hash() === contract.contractType.nodeContract.deploymentHash) {
            twinDeployment.nodeId = contract.contractType.nodeContract.nodeId;
            if (
              twinDeployment.returnNetworkContracts ||
              !(
                twinDeployment.deployment.workloads.length === 1 &&
                twinDeployment.deployment.workloads[0].type === WorkloadTypes.network
              )
            )
              resultContracts.updated.push(contract);
            break;
          }
        }
        await grid3.machines.twinDeploymentHandler.sendToNode(twinDeployment);
        events.emit("logs", `Deployment has been updated with contract_id: ${twinDeployment.deployment.contract_id}`);
      }
    } catch (e) {
      events.emit("logs", `Deployment failed on node_id: ${twinDeployment.nodeId} with error: ${e}`);
    }
  }

  const deletedResult = await grid3.machines.twinDeploymentHandler.tfclient.applyAllExtrinsics<number>(
    deletedExtrinsics,
  );
  if (deletedExtrinsics.length > 0) {
    for (const id of deletedResult) {
      resultContracts.deleted.push({ contractId: id });
      events.emit("logs", `Deployment has been deleted with contract_id: ${id}`);
    }
  }

  try {
    const { passedDeployments, failedDeployments } = await waitForDeployments(grid3, twinDeployments);
    passedDeployments.forEach(deployment => successfulNodes.add(deployment.nodeId));
    failedDeployments.forEach(deployment => failedNodes.add(deployment.twinDeployment.nodeId));
    await grid3.machines.twinDeploymentHandler.saveNetworks(twinDeployments, contracts);
  } catch (error) {
    events.emit("logs", `Deployment Error: ${error}`);
  }

  return { resultContracts, successfulNodes, failedNodes };
}

async function pingNodes(grid3: GridClient, nodes: NodeInfo[]) {
  const pingPromises = nodes.map(async node => {
    try {
      const res = await grid3.zos.pingNode({ nodeId: node.nodeId });
      return { node, res };
    } catch (error) {
      return { node, error };
    }
  });

  const result = await Promise.allSettled(pingPromises).then(results =>
    results.flatMap(r => (r.status === "fulfilled" ? r.value : [])),
  );

  return result;
}
async function main() {
  const grid3 = await getClient();

  grid3.clientOptions.deploymentTimeoutMinutes = 2;
  await grid3._connect();

  const errors: any = [];
  const offlineNodes: number[] = [];
  const batchSize = 3;
  const totalVMs = 6;
  const batches = totalVMs / batchSize;
  const allSuccessfulNodes: number[] = [];
  const allFailedNodes = new Set<number>();

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

    const farmIds = farms.map(farm => farm.farmId);
    const nodes = await grid3.capacity.filterNodes({
      cru: cru,
      mru: mru / 1024,
      sru: rootFs,
      availableFor: await grid3.twins.get_my_twin_id(),
      farmIds: farmIds,
      randomize: true,
      features: [Features.yggdrasil],
    } as FilterOptions);

    console.time("Ping Nodes");
    const results = await pingNodes(grid3, nodes);
    console.timeEnd("Ping Nodes");

    results.forEach(({ node, res, error }) => {
      if (res) {
        console.log(`Node ${node.nodeId} is online`);
      } else {
        offlineNodes.push(node.nodeId);
        console.log(`Node ${node.nodeId} is offline`);
        if (error) console.error("Error:", error);
      }
    });

    const onlineNodes = nodes.filter(node => !offlineNodes.includes(node.nodeId));
    const batchVMs: MachinesModel[] = [];
    for (let i = 0; i < batchSize && onlineNodes.length > 0; i++) {
      const vmName = "vm" + generateString(8);
      const selectedNode = onlineNodes.pop();

      const vm = new MachineModel();
      vm.name = vmName;
      vm.node_id = selectedNode.nodeId;
      vm.disks = [];
      vm.public_ip = publicIp;
      vm.planetary = true;
      vm.mycelium = false;
      vm.cpu = cru;
      vm.memory = mru;
      vm.rootfs_size = rootFs;
      vm.flist = "https://hub.grid.tf/tf-official-apps/base:latest.flist";
      vm.entrypoint = "/sbin/zinit init";
      vm.env = {
        SSH_KEY: config.ssh_key,
      };

      const n = new NetworkModel();
      n.name = "nw" + generateString(5);
      n.ip_range = "10.238.0.0/16";
      n.addAccess = false;

      const vms = new MachinesModel();
      vms.name = "batch" + (batch + 1);
      vms.network = n;
      vms.machines = [vm];
      vms.metadata = "";
      vms.description = `Test deploying vm with name ${vm.name} - Batch ${batch + 1}`;

      batchVMs.push(vms);
    }

    const allTwinDeployments: TwinDeployment[] = [];

    const deploymentPromises = batchVMs.map(async vms => {
      try {
        const [twinDeployments] = await grid3.machines._createDeployment(vms);
        return twinDeployments;
      } catch (error) {
        log(`Error creating deployment for batch ${batch + 1}: ${error}`);
        return [];
      }
    });
    console.time("Preparing Batch " + (batch + 1));
    const deploymentResults = await Promise.allSettled(deploymentPromises).then(results =>
      results.flatMap(r => (r.status === "fulfilled" ? r.value : [])),
    );
    allTwinDeployments.push(...deploymentResults);
    let batchSuccessfulNodes: Set<number> = new Set();
    let batchFailedNodes: Set<number> = new Set();
    if (allTwinDeployments.length > 0) {
      const handlePromises = [handle(grid3, allTwinDeployments)];

      const results = await Promise.allSettled(handlePromises);

      results.forEach(result => {
        if (result.status === "fulfilled") {
          const { resultContracts, successfulNodes, failedNodes } = result.value;
          batchSuccessfulNodes = successfulNodes;
          batchFailedNodes = failedNodes;

          successfulNodes.forEach(node => allSuccessfulNodes.push(node));
          failedNodes.forEach(node => allFailedNodes.add(node));

          log(`Successfully handled deployments for Batch ${batch + 1}`);
        } else {
          errors.push(`Error handling deployments for Batch ${batch + 1}: ${result.reason}`);
        }
      });

      log(`Batch ${batch + 1} Summary:`);
      log(
        `- Successful Deployments on Nodes: ${
          Array.from(batchSuccessfulNodes).length ? Array.from(batchSuccessfulNodes).join(", ") : "-"
        }`,
      );
      log(
        `- Failed Deployments on Nodes: ${
          Array.from(batchFailedNodes).length ? Array.from(batchFailedNodes).join(", ") : "-"
        }`,
      );
      log(`- Successful Deployments: ${batchSuccessfulNodes.size ?? 0}`);
      log(`- Failed Deployments: ${batchFailedNodes.size ?? 0}`);
      log("---------------------------------------------");
    } else {
      log(`No deployments created for Batch ${batch + 1}`);
    }
  }

  console.timeEnd("Total Deployment Time");

  log("Final Summary:");
  log(`- Total Successful Deployments: ${allSuccessfulNodes.length ?? 0}`);
  log(`- Total Failed Deployments: ${totalVMs - allSuccessfulNodes.length}`);
  log(`- Offline Nodes: ${offlineNodes.length ? offlineNodes.join(", ") : "-"}`);
  log(
    `- All Successful Deployments on Nodes: ${
      Array.from(allSuccessfulNodes).length ? Array.from(allSuccessfulNodes).join(", ") : "-"
    }`,
  );
  log(
    `- All Failed Deployments on Nodes: ${
      Array.from(allFailedNodes).length ? Array.from(allFailedNodes).join(", ") : "-"
    }`,
  );

  await grid3.disconnect();
}

main();
