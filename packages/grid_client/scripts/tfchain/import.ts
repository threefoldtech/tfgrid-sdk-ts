import { getClient } from "../client_loader";

async function main() {
    const grid3 = await getClient();
    await grid3.tfchain.init({ name: "mariobassem", secret: grid3.clientOptions.mnemonic });
    await grid3.disconnect();
}

main();
