import { ZOSGetDeploymentModel, ZOSNodeModel } from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function pingNode(client, nodeId) {
  const res = await client.zos.pingNode(nodeId);
  log("================= Pinging node =================");
  log(res);
  log("================= Pinging node =================");
}

async function getDeployment(client, contractId) {
  const res = await client.zos.getDeployment(contractId);
  log("================= Getting deployment =================");
  log(res);
  log("================= Getting deployment =================");
}

async function hasPublicIPv6(client, nodeId) {
  const res = await client.zos.hasPublicIPv6(nodeId);
  log("================= Checking public ipv6 =================");
  log(res);
  log("================= Checking public ipv6 =================");
}

async function listNetworkInterfaces(client, nodeId) {
  const res = await client.zos.listNetworkInterfaces(nodeId);
  log("================= Listing network interfaces =================");
  log(res);
  log("================= Listing network interfaces =================");
}

async function listNetworkPublicIPs(client, nodeId) {
  const res = await client.zos.listNetworkPublicIPs(nodeId);
  log("================= Listing public ips =================");
  log(res);
  log("================= Listing public ips =================");
}

async function getNetworkPublicConfig(client, nodeId) {
  const res = await client.zos.getNetworkPublicConfig(nodeId);
  log("================= Getting public config =================");
  log(res);
  log("================= Getting public config =================");
}

async function getStoragePools(client, nodeId) {
  const res = await client.zos.getStoragePools(nodeId);
  log("================= Getting storage pools =================");
  log(res);
  log("================= Getting storage pools =================");
}

async function getNodeGPUInfo(client, nodeId) {
  const res = await client.zos.getNodeGPUInfo(nodeId);
  log("================= Getting GPU info =================");
  log(res);
  log("================= Getting GPU info =================");
}

async function getNodePerfTests(client, nodeId) {
  const res = await client.zos.getNodePerfTests(nodeId);
  log("================= Getting perf tests =================");
  log(res);
  log("================= Getting perf tests =================");
}

async function getNodeIPerfTest(client, nodeId) {
  const res = await client.zos.getNodeIPerfTest(nodeId);
  log("================= Getting IPerf test =================");
  log(res);
  log("================= Getting IPerf test =================");
}

async function getNodeIPValidation(client, nodeId) {
  const res = await client.zos.getNodeIPValidation(nodeId);
  log("================= Getting Node IP Validation test =================");
  log(res);
  log("================= Getting Node IP Validation test =================");
}

async function getNodeCPUTest(client, nodeId) {
  const res = await client.zos.getNodeCPUTest(nodeId);
  log("================= Getting node CPU test =================");
  log(res);
  log("================= Getting node CPU test =================");
}

async function main() {
  const grid3 = await getClient();
  const nodeId = 11;
  const contractId = 2766;

  const contract: ZOSGetDeploymentModel = {
    contractId: contractId,
  };

  const node: ZOSNodeModel = {
    nodeId: nodeId,
  };

  //Ping Node
  await pingNode(grid3, node);

  //Get deployment
  await getDeployment(grid3, contract);

  //Has public IPV6
  await hasPublicIPv6(grid3, node);

  //List network interfaces
  await listNetworkInterfaces(grid3, node);

  //List network public IPs
  await listNetworkPublicIPs(grid3, node);

  //Get network public config
  await getNetworkPublicConfig(grid3, node);

  //Get storage pools
  await getStoragePools(grid3, node);

  //Get GPU info
  await getNodeGPUInfo(grid3, node);

  // Get perf tests
  await getNodePerfTests(grid3, node);
  await getNodeCPUTest(grid3, node);
  await getNodeIPValidation(grid3, node);
  await getNodeIPerfTest(grid3, node);

  await grid3.disconnect();
}

main();
