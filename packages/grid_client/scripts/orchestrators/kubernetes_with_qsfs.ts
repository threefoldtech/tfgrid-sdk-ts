import { FilterOptions, GridClient, K8SModel, QSFSZDBSModel } from "../../src";
import { config, getClient } from "../client_loader";
import { log, pingNodes } from "../utils";

async function deployQsfs(client: GridClient, qsfs: QSFSZDBSModel) {
  const res = await client.qsfs_zdbs.deploy(qsfs);
  log("================= Deploying QSFS =================");
  log(res);
  log("================= Deploying QSFS =================");
}

async function deploy(client: GridClient, k8s: K8SModel) {
  const res = await client.k8s.deploy(k8s);
  log("================= Deploying K8s =================");
  log(res);
  log("================= Deploying K8s =================");
}

async function getDeployment(client: GridClient, k8s: string) {
  const res = await client.k8s.getObj(k8s);
  log("================= Getting deployment information =================");
  log(res);
  log("================= Getting deployment information =================");
}

async function cancel(client: GridClient, k8s: string) {
  const res = await client.k8s.delete({ name: k8s });
  log("================= Canceling the deployment =================");
  log(res);
  log("================= Canceling the deployment =================");
}

async function deleteQsfs(client: GridClient, qsfs: string) {
  const res = await client.qsfs_zdbs.delete({ name: qsfs });
  log("================= Deleting QSFS =================");
  log(res);
  log("================= Deleting QSFS =================");
}

async function main() {
  const name = "testk8sqsfs";
  const grid3 = await getClient(`kubernetes/${name}`);

  const qsfs_name = "testQsfsK8sq1";
  const disk_size = 1;
  const count = 8;

  const options: FilterOptions = {
    cru: 2,
    mru: 2, // GB
    sru: 6,
    availableFor: grid3.twinId,
    farmId: 1,
  };

  const qsfsQueryOptions: FilterOptions = {
    hru: 15,
    availableFor: grid3.twinId,
    farmId: 1,
  };

  const qsfsNodes: number[] = [];
  let usedResources = 0;

  const nodes = await grid3.capacity.filterNodes(qsfsQueryOptions);

  // Loop over filtered nodes and push in qsfsNodes until they have the required resources
  for (const node of nodes) {
    const freeResources = await grid3.capacity.nodes.getNodeFreeResources(node.nodeId);
    const freeHRU = freeResources.hru / 1024 ** 3;

    if (freeHRU >= disk_size && usedResources <= disk_size * count) {
      qsfsNodes.push(node.nodeId);
      usedResources += freeHRU;
    }

    if (usedResources >= disk_size * count) {
      break;
    }
  }

  async function getNodeId(client: GridClient, options: FilterOptions) {
    const nodes = await client.capacity.filterNodes(options);
    const nodeId = await pingNodes(client, nodes);
    return nodeId;
  }

  //create qsfs object
  const qsfs: QSFSZDBSModel = {
    name: qsfs_name,
    count,
    node_ids: qsfsNodes,
    password: "mypassword1",
    disk_size,
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
        node_id: await getNodeId(grid3, options),
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
        node_id: await getNodeId(grid3, options),
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
  await cancel(grid3, k.name);
  await deleteQsfs(grid3, qsfs_name);

  await grid3.disconnect();
}

main();
