import { FilterOptions, K8SModel, QSFSZDBSModel } from "../../src";
import { config, getClient } from "../client_loader";
import { log } from "../utils";

async function deployQsfs(client, qsfs) {
  const res = await client.qsfs_zdbs.deploy(qsfs);
  log("================= Deploying QSFS =================");
  log(res);
  log("================= Deploying QSFS =================");
}

async function deploy(client, k8s) {
  const res = await client.k8s.deploy(k8s);
  log("================= Deploying K8s =================");
  log(res);
  log("================= Deploying K8s =================");
}

async function getDeployment(client, k8s) {
  const res = await client.k8s.getObj(k8s);
  log("================= Getting deployment information =================");
  log(res);
  log("================= Getting deployment information =================");
}

async function cancel(client, k8s) {
  const res = await client.k8s.delete(k8s);
  log("================= Canceling the deployment =================");
  log(res);
  log("================= Canceling the deployment =================");
}

async function deleteQsfs(client, qsfs) {
  const res = await client.qsfs_zdbs.delete(qsfs);
  log("================= Deleting QSFS =================");
  log(res);
  log("================= Deleting QSFS =================");
}

async function main() {
  const name = "testk8sqsfs";
  const grid3 = await getClient(`kubernetes/${name}`);

  const qsfs_name = "testQsfsK8sq1";

  const masterQueryOptions: FilterOptions = {
    cru: 2,
    mru: 2, // GB
    sru: 6,
    availableFor: grid3.twinId,
    farmId: 1,
  };

  const workerQueryOptions: FilterOptions = {
    cru: 1,
    mru: 1, // GB
    sru: 3,
    availableFor: grid3.twinId,
    farmId: 1,
  };

  const qsfsQueryOptions: FilterOptions = {
    hru: 15,
    availableFor: grid3.twinId,
    farmId: 1,
  };

  const qsfsNodes: number[] = [];

  const allNodes = await grid3.capacity.filterNodes(qsfsQueryOptions);
  if (allNodes.length >= 2) {
    qsfsNodes.push(+allNodes[0].nodeId, +allNodes[1].nodeId);
  } else {
    throw Error("Couldn't find nodes for qsfs");
  }

  //create qsfs object
  const qsfs: QSFSZDBSModel = {
    name: qsfs_name,
    count: 8,
    node_ids: qsfsNodes,
    password: "mypassword1",
    disk_size: 1,
    description: "my qsfs test",
    metadata: "",
  };

  const k: K8SModel = {
    name,
    secret: "secret",
    network: {
      name: "k8sqsfsNetwork",
      ip_range: "10.238.0.0/16",
    },
    masters: [
      {
        name: "master",
        node_id: +(await grid3.capacity.filterNodes(masterQueryOptions))[0].nodeId,
        cpu: 1,
        memory: 1024,
        rootfs_size: 0,
        disk_size: 1,
        public_ip: false,
        public_ip6: false,
        planetary: true,
        mycelium: false,
        qsfs_disks: [
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
        ],
      },
    ],
    workers: [
      {
        name: "worker",
        node_id: +(await grid3.capacity.filterNodes(workerQueryOptions))[0].nodeId,
        cpu: 1,
        memory: 1024,
        rootfs_size: 0,
        disk_size: 1,
        public_ip: false,
        public_ip6: false,
        planetary: true,
        mycelium: false,
      },
    ],
    metadata: "",
    description: "test deploying k8s via ts grid3 client",
    ssh_key: config.ssh_key,
  };

  //Deploy QSFS
  await deployQsfs(grid3, qsfs);

  //Deploy K8s
  await deploy(grid3, k);

  //Get the deployment
  await getDeployment(grid3, name);

  // //Uncomment the line below to cancel the deployment
  // await cancel(grid3, { name: k.name });
  // await deleteQsfs(grid3, { name: qsfs_name });

  await grid3.disconnect();
}

main();
