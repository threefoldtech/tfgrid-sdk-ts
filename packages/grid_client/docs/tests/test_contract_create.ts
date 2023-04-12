import { DiskModel, MachineModel, MachinesModel, NetworkModel } from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
    const grid3 = await getClient();

    await grid3.contracts.create_node({
        data: "",
        hash: "2bf617b2d934231bd7c92d661ffffda1",
        node_id: 30,
        public_ip: 1,
    });

    await grid3.disconnect();
}

main();
