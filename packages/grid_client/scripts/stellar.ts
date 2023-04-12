import { getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
    const grid3 = await getClient();

    const created_account = await grid3.stellar.create({ name: "stellarTest" });
    log(created_account);

    await grid3.stellar.init({
        name: "stellarTest2",
        secret: "SBCWGJ4A4IHDUUXPASQBL7VKGZGNRMVNV66GO5P6FU6Q4NDKHIHZFRKI",
    });

    log(await grid3.stellar.list());
    log(await grid3.stellar.exist({ name: "stellarTest2" }));

    const test_account = await grid3.stellar.get({ name: "stellarTest2" });
    log(test_account);

    log(await grid3.stellar.balance_by_address({ address: test_account.public_key }));
    log(await grid3.stellar.assets({ name: "stellarTest2" }));
    log(await grid3.stellar.sign({ name: "stellarTest2", content: "message" }));

    await grid3.stellar.pay({
        name: "stellarTest2",
        address_dest: created_account.public_key,
        amount: 1,
        description: "paytest",
        asset: "XLM",
    });

    log(await grid3.stellar.delete({ name: "stellarTest" }));
    log(await grid3.stellar.delete({ name: "stellarTest2" }));

    grid3.disconnect();
}

main();
