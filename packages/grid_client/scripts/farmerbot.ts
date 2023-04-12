import { FarmIdModel } from "../src";
import { FarmerBotFindNodeModel } from "../src/high_level/farmerbot";
import { getClient } from "./client_loader";

async function main() {
    const grid3 = await getClient();
    const farmId: FarmIdModel = {
        farmId: 53,
    };

    const pingFarm = await grid3.farmerbot.pingFarm(farmId);
    console.log("pingFarm", pingFarm);

    const FarmerBotFindNode: FarmerBotFindNodeModel = {
        farmId: farmId.farmId,
        // required_cru: 4,
        // required_mru: 5,
        // required_sru: 5,
        // required_hru: 5,
    };

    if (pingFarm.twinid) {
        const node = await grid3.farmerbot.findNode(FarmerBotFindNode);
        console.log("node", node);
    }

    await grid3.disconnect();
}

main();
