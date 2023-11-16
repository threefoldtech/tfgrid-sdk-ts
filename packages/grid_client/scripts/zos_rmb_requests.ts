import { ZOSGetDeploymentModel, ZOSNodeModel } from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function pingNode(client, nodeId) {
  try {
    const res = await client.zos.pingNode(nodeId);
    log("================= Pinging node =================");
    log(res);
    log("================= Pinging node =================");
  } catch (error) {
    log("Error while pinging node " + error);
  }
}

async function getDeployment(client, contractId) {
  try {
    const res = await client.zos.getDeployment(contractId);
    log("================= Getting deployment =================");
    log(res);
    log("================= Getting deployment =================");
  } catch (error) {
    log("Error while getting deployment " + error);
  }
}

async function hasPublicIPv6(client, nodeId) {
  try {
    const res = await client.zos.hasPublicIPv6(nodeId);
    log("================= Checking public ipv6 =================");
    log(res);
    log("================= Checking public ipv6 =================");
  } catch (error) {
    log("Error while checking public ipv6 " + error);
  }
}

async function listNetworkInterfaces(client, nodeId) {
  try {
    const res = await client.zos.listNetworkInterfaces(nodeId);
    log("================= Listing network interfaces =================");
    log(res);
    log("================= Listing network interfaces =================");
  } catch (error) {
    log("Error while listing network interfaces " + error);
  }
}

async function listNetworkPublicIPs(client, nodeId) {
  try {
    const res = await client.zos.listNetworkPublicIPs(nodeId);
    log("================= Listing public ips =================");
    log(res);
    log("================= Listing public ips =================");
  } catch (error) {
    log("Error while listing public ips " + error);
  }
}

async function getNetworkPublicConfig(client, nodeId) {
  try {
    const res = await client.zos.getNetworkPublicConfig(nodeId);
    log("================= Getting public config =================");
    log(res);
    log("================= Getting public config =================");
  } catch (error) {
    log("Error while getting public config " + error);
  }
}

async function getStoragePools(client, nodeId) {
  try {
    const res = await client.zos.getStoragePools(nodeId);
    log("================= Getting storage pools =================");
    log(res);
    log("================= Getting storage pools =================");
  } catch (error) {
    log("Error while getting storage pools " + error);
  }
}

async function getNodeGPUInfo(client, nodeId) {
  try {
    const res = await client.zos.getNodeGPUInfo(nodeId);
    log("================= Getting GPU info =================");
    log(res);
    log("================= Getting GPU info =================");
  } catch (error) {
    log("Error while getting GPU info " + error);
  }
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

  await grid3.disconnect();
}

main();
