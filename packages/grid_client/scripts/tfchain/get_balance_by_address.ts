import { getClient } from "../client_loader";

async function main() {
    const grid3 = await getClient();
    const balance = await grid3.tfchain.balanceByAddress({
        address: "5FfAv7qUb3oa8TfdeLCEicirtdGvXHnV2owtsv5XNa9aDzEu",
    });
    console.log(balance);
    await grid3.disconnect();
}

main();
