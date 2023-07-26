import { pingFarmModel } from "../src";
import { FarmerBotFindNodeModel } from "../src/high_level/farmerbot";
import { getClient } from "./client_loader";

async function main() {
  const grid3 = await getClient();
  const farm: pingFarmModel = {
    farmId: 53,
  };

  const pingFarm = await grid3.farmerbot.pingFarm(farm);
  console.log("pingFarm", pingFarm);

  const FarmerBotFindNode: FarmerBotFindNodeModel = {
    farmId: farm.farmId,
    required_cru: 4,
    required_mru: 5,
    required_sru: 5,
    required_hru: 5,
    // has_gpus: 2, // Uncomment it if you want to get only nodes with gpus.
  };

  if (pingFarm.twinid) {
    const node = await grid3.farmerbot.findNode(FarmerBotFindNode);
    console.log("node", node);
  }

  await grid3.disconnect();
}

main();
