import { FilterOptions, K8SModel, KubernetesNodeModel, NetworkModel } from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
  const grid3 = await getClient();

  const qsfs_name = "testQsfsK8sq1";

  const masterQueryOptions: FilterOptions = {
    cru: 2,
    mru: 2, // GB
    sru: 2,
    availableFor: grid3.twinId,
    farmId: 1,
  };

  const workerQueryOptions: FilterOptions = {
    cru: 1,
    mru: 1, // GB
    sru: 1,
    availableFor: grid3.twinId,
    farmId: 1,
  };

  const qsfsQueryOptions: FilterOptions = {
    hru: 6,
    availableFor: grid3.twinId,
    farmId: 1,
  };

  const qsfsNodes = [];

  const allNodes = await grid3.capacity.filterNodes(qsfsQueryOptions);
  if (allNodes.length >= 2) {
    qsfsNodes.push(+allNodes[0].nodeId, +allNodes[1].nodeId);
  } else {
    throw Error("Couldn't find nodes for qsfs");
  }

  //create qsfs object
  const qsfs = {
    name: qsfs_name,
    count: 8,
    node_ids: qsfsNodes,
    password: "mypassword1",
    disk_size: 1,
    description: "my qsfs test",
    metadata: "",
  };

  // create network Object
  const n = new NetworkModel();
  n.name = "k8sqsfsNetwork";
  n.ip_range = "10.238.0.0/16";

  // create k8s node Object
  const master = new KubernetesNodeModel();
  master.name = "master";
  master.node_id = +(await grid3.capacity.filterNodes(masterQueryOptions))[0].nodeId;
  master.cpu = 1;
  master.memory = 1024;
  master.rootfs_size = 0;
  master.disk_size = 1;
  master.public_ip = false;
  master.planetary = true;
  master.qsfs_disks = [
    {
      qsfs_zdbs_name: qsfs_name,
      name: "testQsfsK8sd1",
      minimal_shards: 2,
      expected_shards: 4,
      encryption_key: "hamada",
      prefix: "hamada",
      cache: 1,
      mountpoint: "/myqsfsdisk",
    },
  ];

  // create k8s node Object
  const worker = new KubernetesNodeModel();
  worker.name = "worker";
  worker.node_id = +(await grid3.capacity.filterNodes(workerQueryOptions))[0].nodeId;
  worker.cpu = 1;
  worker.memory = 1024;
  worker.rootfs_size = 0;
  worker.disk_size = 1;
  worker.public_ip = false;
  worker.planetary = true;

  // create k8s Object
  const k = new K8SModel();
  k.name = "testk8sqsfs";
  k.secret = "secret";
  k.network = n;
  k.masters = [master];
  k.workers = [worker];
  k.metadata = "";
  k.description = "test deploying k8s via ts grid3 client";
  k.ssh_key = config.ssh_key;

  //Deploy QSFS
  await deployQsfs(grid3, qsfs);

  //Deploy K8s
  await deploy(grid3, k);

  //Get the deployment
  await getDeployment(grid3, k.name);

  // //Uncomment the line below to cancel the deployment
  // await cancel(grid3, { name: k.name });
  // await deleteQsfs(grid3, { name: qsfs_name });

  await grid3.disconnect();
}

async function deployQsfs(client, qsfs) {
  try {
    const res = await client.qsfs_zdbs.deploy(qsfs);
    log("================= Deploying QSFS =================");
    log(res);
    log("================= Deploying QSFS =================");
  } catch (error) {
    log("Error while Deploying QSFS " + error);
  }
}

async function deploy(client, k8s) {
  try {
    const res = await client.k8s.deploy(k8s);
    log("================= Deploying K8s =================");
    log(res);
    log("================= Deploying K8s =================");
  } catch (error) {
    log("Error while Deploying the cluster " + error);
  }
}

async function getDeployment(client, k8s) {
  try {
    const res = await client.k8s.getObj(k8s);
    log("================= Getting deployment information =================");
    log(res);
    log("================= Getting deployment information =================");
  } catch (error) {
    log("Error while getting the deployment " + error);
  }
}

async function cancel(client, k8s) {
  try {
    const res = await client.k8s.delete(k8s);
    log("================= Canceling the deployment =================");
    log(res);
    log("================= Canceling the deployment =================");
  } catch (error) {
    log("Error while canceling the deployment " + error);
  }
}

async function deleteQsfs(client, qsfs) {
  try {
    const res = await client.qsfs_zdbs.delete(qsfs);
    log("================= Deleting QSFS =================");
    log(res);
    log("================= Deleting QSFS =================");
  } catch (error) {
    log("Error while deleting qsfs " + error);
  }
}

main();
