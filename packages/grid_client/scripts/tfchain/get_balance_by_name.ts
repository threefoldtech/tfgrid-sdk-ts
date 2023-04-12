import { getClient } from "../client_loader";

async function main() {
    const grid3 = await getClient();
    const balance = await grid3.tfchain.assets({ name: "mariobassem" });
    console.log(balance);
    await grid3.disconnect();
}

main();
