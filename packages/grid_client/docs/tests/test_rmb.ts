import { config, getClient } from "./client_loader";

async function main() {
    const grid3 = await getClient();

    const id = await grid3.rmbClient.send("twinserver.contracts.get", JSON.stringify({ id: 19510 }), 26, 5);
    const twins = await grid3.rmbClient.read(id);
    console.log(twins);
    grid3.disconnect();
}
main();
