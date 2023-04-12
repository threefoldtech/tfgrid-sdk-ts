import { getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
    const grid3 = await getClient();
    const contract = await grid3.nodes.reserve({ nodeId: 1 });
    log(contract);
    log(await grid3.nodes.getReservationContractId({ nodeId: 1 }));
    log(await grid3.nodes.unreserve({ nodeId: 1 }));
    await grid3.disconnect();
}

main();
