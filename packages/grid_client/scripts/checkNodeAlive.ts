import { getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
    const grid3 = await getClient();
    try {
        log(await grid3.zos.pingNode({ nodeId: 15 }));
    } catch {
        log(`node 15 is offline`);
    }
    try {
        log(await grid3.zos.pingNode({ nodeId: 1111111111 }));
    } catch {
        log("node 111111 is offline");
    }
    await grid3.disconnect();
}

main();
