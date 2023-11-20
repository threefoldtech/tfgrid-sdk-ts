import { BlockchainCreateModel, BlockchainInitModel, GridClient } from "../src";
import { blockchainType } from "../src/modules/blockchainInterface";
import { getClient } from "./client_loader";
import { log } from "./utils";

let grid3: GridClient;
const message = "a message";
const hexMessage = message
  .split("")
  .map((letter, i) => message.charCodeAt(i).toString(16))
  .join("");

async function main() {
  const algorand_mnemonic =
    "wood clump category carpet cabin cement joy cover this hour armor twist write trade term only label later lizard disease boil pelican dish ability this";

  grid3 = await getClient();

  //change the relay to the desired network
  const relay = "relay.dev.grid.tf";

  const algorandAccount: BlockchainCreateModel = {
    name: "createAlgorand",
    blockchain_type: blockchainType.algorand,
  };
  const stellarAccount: BlockchainCreateModel = {
    name: "createStellar",
    relay: relay,
    blockchain_type: blockchainType.stellar,
  };
  const tfchainAccount: BlockchainCreateModel = {
    name: "createTfchain",
    relay: relay,
    blockchain_type: blockchainType.tfchain,
  };
  const importAlgorand: BlockchainInitModel = {
    name: "algorandClient",
    secret: algorand_mnemonic,
    blockchain_type: blockchainType.algorand,
  };
  const importStellar: BlockchainInitModel = {
    name: "stellarClient",
    secret: "SBCWGJ4A4IHDUUXPASQBL7VKGZGNRMVNV66GO5P6FU6Q4NDKHIHZFRKI",
    blockchain_type: blockchainType.stellar,
  };
  const importTFchain: BlockchainInitModel = {
    name: "tfchainClient",
    secret: grid3.clientOptions.mnemonic,
    blockchain_type: blockchainType.tfchain,
  };

  await createAccount(algorandAccount);
  const stellar_account = await createAccount(stellarAccount);
  const tfchain_account = await createAccount(tfchainAccount);

  await importAccount(importAlgorand);
  await importAccount(importStellar);
  await importAccount(importTFchain);

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

async function createAccount(account) {
  try {
    const account_created = await grid3.blockchain.create(account);
    log(account_created);
    return account_created;
  } catch (err) {
    console.log(err);
  }
}

async function importAccount(account) {
  try {
    const account_imported = await grid3.blockchain.init(account);
    log(account_imported);
  } catch (err) {
    console.log(err);
  }
}

main();
