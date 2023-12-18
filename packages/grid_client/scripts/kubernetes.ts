import { FilterOptions, K8SModel } from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

async function deploy(client, k8s) {
  try {
    const res = await client.k8s.deploy(k8s);
    log("================= Deploying K8s =================");
    log(res);
    log("================= Deploying K8s =================");
  } catch (error) {
    console.error("Error while Deploying the cluster ", error.message);
  }
}

async function getDeployment(client, k8s) {
  try {
    const res = await client.k8s.getObj(k8s);
    log("================= Getting deployment information =================");
    log(res);
    log("================= Getting deployment information =================");
  } catch (error) {
    console.error("Error while getting the deployment ", error.message);
  }
}

async function cancel(client, k8s) {
  try {
    const res = await client.k8s.delete(k8s);
    log("================= Canceling the deployment =================");
    log(res);
    log("================= Canceling the deployment =================");
  } catch (error) {
    console.error("Error while canceling the deployment ", error.message);
  }
}

async function main() {
  const grid3 = await getClient();

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

  const k: K8SModel = {
    name: "testk8s",
    secret: "secret",
    network: {
      name: "monNetwork",
      ip_range: "10.238.0.0/16",
      addAccess: true,
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
      },
    ],
    metadata: "",
    description: "test deploying k8s via ts grid3 client",
    ssh_key: config.ssh_key,
  };

  //Deploy K8s
  await deploy(grid3, k);

  //Get the deployment
  await getDeployment(grid3, k.name);

  //Uncomment the line below to cancel the deployment
  // await cancel(grid3, { name: k.name });

  await grid3.disconnect();
}

main();
