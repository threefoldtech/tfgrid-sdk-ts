import { FilterOptions, NodeFreeResourcesModel, NodesByFarmIdModel } from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function getFarms(client) {
  try {
    const res = await client.capacity.getFarms();
    log("================= Getting farms =================");
    log(res);
    log("================= Getting farms =================");
  } catch (error) {
    log("Error while getting farms " + error);
  }
}

async function getNodes(client) {
  try {
    const res = await client.capacity.getNodes();
    log("================= Getting nodes =================");
    log(res);
    log("================= Getting nodes =================");
  } catch (error) {
    log("Error while getting nodes " + error);
  }
}

async function getNodesByFarmId(client, farmId) {
  try {
    const res = await client.capacity.getNodesByFarmId(farmId);
    log("================= Getting nodes =================");
    log(res);
    log("================= Getting nodes =================");
  } catch (error) {
    log("Error while getting nodes " + error);
  }
}

async function getNodeFreeResources(client, nodeId) {
  try {
    const res = await client.capacity.getNodeFreeResources(nodeId);
    log("================= Getting resources =================");
    log(res);
    log("================= Getting resources =================");
  } catch (error) {
    log("Error while getting resources " + error);
  }
}

async function filterNodes(client, filterOptions) {
  try {
    const res = await client.capacity.filterNodes(filterOptions);
    log("================= Filtering nodes =================");
    log(res);
    log("================= Filtering nodes =================");
  } catch (error) {
    log("Error while filtering nodes " + error);
  }
}

async function main() {
  const grid3 = await getClient();

  const nodeOptions: FilterOptions = {
    country: "Belgium",
    publicIPs: true,
    cru: 20,
    sru: 50,
  };

  const farm: NodesByFarmIdModel = {
    farmId: 1,
  };

  const node: NodeFreeResourcesModel = {
    nodeId: 14,
  };

  //Get farms
  await getFarms(grid3);

  //Get nodes
  await getNodes(grid3);

  //Get nodes by farm Id
  await getNodesByFarmId(grid3, farm);

  //Get nodes' free resources
  await getNodeFreeResources(grid3, node);

  //Filter nodes
  await filterNodes(grid3, nodeOptions);

  await grid3.disconnect();
}

main();
