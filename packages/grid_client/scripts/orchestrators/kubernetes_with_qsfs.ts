import { Features, FilterOptions, generateString, GridClient, K8SModel, QSFSZDBSModel } from "../../src";
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
  const name = "k8s" + generateString(8);
  const grid3 = await getClient(`kubernetes/${name}`);

  const qsfs_name = generateString(10);
  const disk_size = 1;
  const count = 8;
  const options: FilterOptions = {
    cru: 2,
    mru: 2, // GB
    sru: 6,
    availableFor: grid3.twinId,
    farmId: 1,
    features: [Features.wireguard],
  };

  const qsfsQueryOptions: FilterOptions = {
    hru: count * disk_size,
    availableFor: grid3.twinId,
    farmId: 1,
  };

  async function getNodeId(client: GridClient, options: FilterOptions) {
    const nodes = await client.capacity.filterNodes(options);
    const nodeId = await pingNodes(client, nodes);
    return nodeId;
  }

  const qsfsNode = await getNodeId(grid3, qsfsQueryOptions);
  const masterNode = await getNodeId(grid3, options);
  const workerNode = await getNodeId(grid3, { ...options, nodeExclude: [masterNode] });
  const networkName = `net${name}`;

  //create qsfs object
  const qsfs: QSFSZDBSModel = {
    name: qsfs_name,
    count,
    node_ids: [qsfsNode],
    password: generateString(10),
    disk_size,
    description: generateString(10),
    metadata: "",
  };

  const k: K8SModel = {
    name,
    secret: generateString(10),
    network: {
      name: networkName,
      ip_range: "10.238.0.0/16",
    },
    masters: [
      {
        name: generateString(10),
        node_id: masterNode,
        cpu: 1,
        memory: 1024,
        rootfs_size: 0,
        disk_size: 1,
        public_ip: false,
        public_ip6: false,
        planetary: true,
        mycelium: true,
        qsfs_disks: [
          {
            qsfs_zdbs_name: qsfs_name,
            name: generateString(10),
            minimal_shards: 2,
            expected_shards: 4,
            encryption_key: generateString(5),
            prefix: generateString(5),
            cache: 1,
            mountpoint: "/myqsfsdisk",
          },
        ],
      },
    ],
    workers: [
      {
        name: generateString(10),
        node_id: workerNode,
        cpu: 1,
        memory: 1024,
        rootfs_size: 0,
        disk_size: 1,
        public_ip: false,
        public_ip6: false,
        planetary: true,
        mycelium: true,
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
  // await cancel(grid3, { name: `<<Replace with deployment name>>` });
  // await cancel(grid3, { qsfs_name: `<<Replace with QSFS name>>` });

  await grid3.disconnect();
}

main();
