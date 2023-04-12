import { getClient } from "../client_loader";

async function main() {
    const grid3 = await getClient();
    const account = await grid3.tfchain.get({ name: "newacc1" });
    console.log("address: " + account.public_key);
    await grid3.disconnect();
}

main();
