import { pingFarmModel } from "../src";
import { FarmerBotFindNodeModel } from "../src/high_level/farmerbot";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function pingFarm(client, farm) {
  const res = await client.farmerbot.pingFarm(farm);
  log("================= Pinging farm =================");
  log(res);
  log("================= Pinging farm =================");
}

async function findNode(client, FarmerBotFindNode) {
  const res = await client.farmerbot.findNode(FarmerBotFindNode);
  log("================= Finding node =================");
  log(res);
  log("================= Finding node =================");
}

async function main() {
  const grid3 = await getClient();
  const farm: pingFarmModel = {
    farmId: 53,
  };

  const FarmerBotFindNode: FarmerBotFindNodeModel = {
    farmId: farm.farmId,
    required_cru: 4,
    required_mru: 5,
    required_sru: 5,
    required_hru: 5,
    // has_gpus: 2, // Uncomment it if you want to get only nodes with gpus.
  };

  //Ping Farm
  await pingFarm(grid3, farm);

  //Find Node
  await findNode(grid3, FarmerBotFindNode);

  await grid3.disconnect();
}

main();
