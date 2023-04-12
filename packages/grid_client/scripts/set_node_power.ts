import { NodePowerModel } from "../src/modules";
import { getClient } from "./client_loader";

async function main() {
    const grid3 = await getClient();

    const nodePower: NodePowerModel = {
        nodeId: 73,
        power: true,
    };

    try {
        await grid3.nodes.setNodePower(nodePower);
    } catch (error) {
        console.log(error);
    }

    await grid3.disconnect();
}

main();
