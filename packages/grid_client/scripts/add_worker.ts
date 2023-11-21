import { AddWorkerModel, FilterOptions } from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

// Please run kubernetes script first before running this one to create the cluster.

async function addWorker(client, worker) {
  try {
    const res = await client.k8s.add_worker(worker);
    log("================= Adding worker =================");
    log(res);
    log("================= Adding worker =================");
  } catch (error) {
    log("Error while adding the worker" + error);
  }
}

async function getWorker(client, worker) {
  try {
    const res = await client.k8s.getObj(worker);
    log("================= Getting worker information =================");
    log(res);
    log("================= Getting worker information =================");
  } catch (error) {
    log("Error while getting the worker" + error);
  }
}

async function deleteWorker(client, worker) {
  try {
    const res = await client.k8s.delete_worker(worker);
    log("================= Deleting the worker =================");
    log(res);
    log("================= Deleting the worker =================");
  } catch (error) {
    log("Error while deleting the worker" + error);
  }
}

async function main() {
  const grid3 = await getClient();

  const workerQueryOptions: FilterOptions = {
    cru: 2,
    mru: 1, // GB
    sru: 10,
    farmId: 1,
  };

  const worker: AddWorkerModel = {
    deployment_name: "testk8s",
    name: "worker2",
    node_id: +(await grid3.capacity.filterNodes(workerQueryOptions))[0].nodeId,
    cpu: 2,
    memory: 1024,
    rootfs_size: 0,
    disk_size: 8,
    public_ip: false,
    public_ip6: false,
    planetary: true,
  };

  //Add Worker
  await addWorker(grid3, worker);

  //Get worker information
  await getWorker(grid3, worker.deployment_name);

  //Uncomment the line below to delete the worker
  // await deleteWorker(grid3, { name: worker.name, deployment_name: worker.deployment_name });

  await grid3.disconnect();
}

main();
