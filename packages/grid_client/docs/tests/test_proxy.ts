import { RMB } from "../../src";
import { getClient } from "../../scripts/client_loader";

async function main() {
    const gridClient = await getClient();
    const node_twin_id = 22;
    const cmd = "zos.statistics.get";
    const payload = JSON.stringify("");
    const rmbClient = gridClient.rmbClient;
    // rmbClient["twinId"] = 24;
    const rmb = new RMB(rmbClient);
    const result = await rmb.request([node_twin_id], cmd, payload, 0, 2);
    console.log(result);
    gridClient.disconnect();
}
main();
