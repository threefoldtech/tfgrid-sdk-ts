import { GridClient } from "../src";
import { blockchainType } from "../src/modules/blockchainInterface";
import { getClient } from "./client_loader";
import { log } from "./utils";

let grid3: GridClient;
const ip = "2a02:1812:1443:300:7913:de17:4c83:ecb2";
const message = "a message";
const hexMessage = message
    .split("")
    .map((letter, i) => message.charCodeAt(i).toString(16))
    .join("");

async function main() {
    const algorand_mnemonic =
        "wood clump category carpet cabin cement joy cover this hour armor twist write trade term only label later lizard disease boil pelican dish ability this";

    grid3 = await getClient();

    await createAccount("createAlgorand", blockchainType.algorand);
    const stellar_account = await createAccount("createStellar", blockchainType.stellar);
    const tfchain_account = await createAccount("createTfchain", blockchainType.tfchain, ip);

    await importAccount("algorandClient", algorand_mnemonic, blockchainType.algorand);
    await importAccount(
        "stellarClient",
        "SBCWGJ4A4IHDUUXPASQBL7VKGZGNRMVNV66GO5P6FU6Q4NDKHIHZFRKI",
        blockchainType.stellar,
    );
    await importAccount("tfchainClient", grid3.mnemonic, blockchainType.tfchain);

    // List all
    const accounts = await grid3.blockchain.list();
    log(accounts);

    //algorand
    await grid3.blockchain.select({ name: "algorandClient" });
    log(await grid3.blockchain.get());
    log(await grid3.blockchain.assets());
    log(await grid3.blockchain.sign({ content: hexMessage }));
    await grid3.blockchain.pay({
        address_dest: "HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUED6DKFD5ZD24PMJ3MVA",
        amount: 10,
        asset: "",
        description: "test",
        blockchain_type_dest: blockchainType.algorand,
    });
    await grid3.blockchain.delete();

    //stellar
    await grid3.blockchain.select({ name: "stellarClient" });
    log(await grid3.blockchain.get());
    log(await grid3.blockchain.assets());
    log(await grid3.blockchain.sign({ content: "testSign" }));
    await grid3.blockchain.pay({
        address_dest: stellar_account.public_key,
        amount: 100,
        description: "test",
        asset: "XLM",
        blockchain_type_dest: blockchainType.stellar,
    });
    await grid3.blockchain.delete();

    //tfchain
    await grid3.blockchain.select({ name: "tfchainClient" });
    log(await grid3.blockchain.get());
    log(await grid3.blockchain.assets());
    log(await grid3.blockchain.sign({ content: "testSign" }));
    await grid3.blockchain.pay({
        address_dest: tfchain_account.public_key,
        amount: 100,
        asset: "",
        description: "test",
        blockchain_type_dest: blockchainType.tfchain,
    });
    await grid3.blockchain.delete();

    await grid3.stellar.delete({ name: "createStellar" });
    await grid3.algorand.delete({ name: "createAlgorand" });
    await grid3.tfchain.delete({ name: "createTfchain" });

    await grid3.disconnect();
}

async function createAccount(account_name: string, blockchain_type: blockchainType, ip?: string) {
    try {
        const account_created = await grid3.blockchain.create({
            name: account_name,
            ip: ip,
            blockchain_type: blockchain_type,
        });
        log(account_created);
        return account_created;
    } catch (err) {
        console.log(err);
    }
}

async function importAccount(account_name: string, secret: string, blockchain_type: blockchainType) {
    try {
        const account_imported = await grid3.blockchain.init({
            name: account_name,
            secret: secret,
            blockchain_type: blockchain_type,
        });
        log(account_imported);
    } catch (err) {
        console.log(err);
    }
}

main();
