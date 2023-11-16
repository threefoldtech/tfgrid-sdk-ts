import {
  AlgorandAccountAssetsFromAddressModel,
  AlgorandAccountCreateModel,
  AlgorandAccountInitModel,
  AlgorandCreateTransactionModel,
  AlgorandSignatureModel,
  AlgorandTransferModel,
  BlockchainDeleteModel,
  BlockchainGetModel,
  BlockchainSignModel,
  GridClient,
} from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";
let grid3: GridClient;
const test_account_address = "EBABIFYHKVSMFEV66M7SMIILEZCJ4SHBC3FPGISFFTRIIG6VX3KGSAXR34";
const mnemonic =
  "wood clump category carpet cabin cement joy cover this hour armor twist write trade term only label later lizard disease boil pelican dish ability this";
const message = "a message";
const hexMessage = message
  .split("")
  .map((letter, i) => message.charCodeAt(i).toString(16))
  .join("");
async function main() {
  await getClient().then(res => (grid3 = res));
  await createAccount("myaccount");
  await importAccount("manana", mnemonic);
  await getAccountAssetsFromAddress(test_account_address);
  await getAccountAssetsFromName("manana");
  await createTransaction("manana");
  await signBytes("manana", hexMessage);
  await signTransaction("manana");
  await getAccountMnemonicFromName("manana");
  await checkAccountExistsFromName("manana");
  await listAccounts();
  await transferAccount("manana");
  await deleteAccount("manana");
  await deleteAccount("myaccount");

  grid3.disconnect();
}

async function createAccount(account_name: string) {
  try {
    const account_created: AlgorandAccountCreateModel = {
      name: account_name,
    };
    await grid3.algorand.create(account_created);
    log(account_created);
  } catch (err) {
    console.log(err);
  }
}
async function importAccount(account_name: string, account_mnemonic: string) {
  try {
    const importedAccount: AlgorandAccountInitModel = {
      name: account_name,
      secret: account_mnemonic,
    };
    const account_imported = await grid3.algorand.init(importedAccount);
    log(account_imported);
  } catch (err) {
    console.log(err);
  }
}
async function getAccountAssetsFromName(account_name: string) {
  try {
    const assets: BlockchainGetModel = {
      name: account_name,
    };
    const account_assets = await grid3.algorand.assets(assets);
    log(account_assets);
  } catch (err) {
    console.log(err);
  }
}
async function getAccountAssetsFromAddress(account_address: string) {
  try {
    const assets: AlgorandAccountAssetsFromAddressModel = {
      address: account_address,
    };
    const account_assets = await grid3.algorand.assetsByAddress(assets);
    log(account_assets);
  } catch (err) {
    console.log(err);
  }
}
async function createTransaction(account_name: string) {
  try {
    const receiver = "HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUED6DKFD5ZD24PMJ3MVA";
    const transaction: AlgorandCreateTransactionModel = {
      name: account_name,
      address_dest: receiver,
      amount: 100,
      description: "my nana",
    };
    const account_tx = await grid3.algorand.createTransaction(transaction);
    log(account_tx);
  } catch (err) {
    console.log(err);
  }
}
async function getAccountMnemonicFromName(account_name) {
  try {
    const getAccount: BlockchainGetModel = {
      name: account_name,
    };
    const account = await grid3.algorand.get(getAccount);
    log(account);
  } catch (err) {
    console.log(err);
  }
}
async function deleteAccount(account_name: string) {
  try {
    const deleteAccount: BlockchainDeleteModel = {
      name: account_name,
    };
    const deleteAccountConfirmation = await grid3.algorand.delete(deleteAccount);
    log(deleteAccountConfirmation);
  } catch (err) {
    console.log(err);
  }
}
async function listAccounts() {
  try {
    const accountsList = await grid3.algorand.list();
    log(accountsList);
  } catch (err) {
    console.log(err);
  }
}
async function checkAccountExistsFromName(account_name: string) {
  try {
    const account: BlockchainGetModel = {
      name: account_name,
    };
    const accountExist = await grid3.algorand.exist(account);
    log(accountExist);
  } catch (err) {
    console.log(err);
  }
}
async function signBytes(account_name: string, text: string) {
  try {
    const message: BlockchainSignModel = {
      content: text,
      name: account_name,
    };
    const signed_txn = await grid3.algorand.sign(message);
    log(signed_txn);
  } catch (err) {
    console.log(err);
  }
}
async function signTransaction(account_name: string) {
  try {
    const receiver = "HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUED6DKFD5ZD24PMJ3MVA";
    const transactionModel: AlgorandCreateTransactionModel = {
      name: account_name,
      address_dest: receiver,
      amount: 100,
      description: "my nana",
    };
    const txn = await grid3.algorand.createTransaction(transactionModel);

    const transaction: AlgorandSignatureModel = {
      txn: txn,
      name: account_name,
    };
    const signed_txn = await grid3.algorand.sign_txn(transaction);
    log(signed_txn);
  } catch (err) {
    console.log(err);
  }
}
async function transferAccount(account_name: string) {
  try {
    const receiver = "HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUED6DKFD5ZD24PMJ3MVA";
    const transfer: AlgorandTransferModel = {
      name: account_name,
      address_dest: receiver,
      amount: 100,
      description: "my nana",
    };
    const account_tx = await grid3.algorand.pay(transfer);
    log(account_tx);
  } catch (err) {
    console.log(err);
  }
}

main();
