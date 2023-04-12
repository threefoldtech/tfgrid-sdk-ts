import { getClient } from "../client_loader";

async function main() {
    const grid3 = await getClient();
    const target_address = "5F7ctVSmDXMM3yTQszZy47QgvNxaeUPPRz5p3oBaK9jTeNgf";
    await grid3.tfchain.pay({ name: "mariobassem", address_dest: target_address, amount: 100 });
    await grid3.disconnect();
}

main();
