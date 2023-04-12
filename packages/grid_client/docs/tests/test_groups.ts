import { getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
    const grid3 = await getClient();
    const g = await grid3.groups.create();
    log(g);
    log(await grid3.groups.get({ id: g }));
    log(await grid3.groups.delete({ id: g }));
    await grid3.disconnect();
}

main();
