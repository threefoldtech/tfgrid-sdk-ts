import {
  BlockchainDeleteModel,
  BlockchainGetModel,
  BlockchainSignModel,
  StellarWalletBalanceByAddressModel,
  StellarWalletCreateModel,
  StellarWalletInitModel,
  StellarWalletTransferModel,
} from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function create(client, account) {
  const res = await client.stellar.create(account);
  log("================= Creating account =================");
  log(res);
  log("================= Creating account =================");
  return res;
}

async function init(client, account) {
  const res = await client.stellar.init(account);
  log("================= Initializing account =================");
  log(res);
  log("================= Initializing account =================");
}

async function list(client) {
  const res = await client.stellar.list();
  log("================= Listing account =================");
  log(res);
  log("================= Listing account =================");
}

async function exist(client, account) {
  const res = await client.stellar.exist(account);
  log("================= Checking account =================");
  log(res);
  log("================= Checking account =================");
}

async function get(client, account) {
  const res = await client.stellar.get(account);
  log("================= Getting account =================");
  log(res);
  log("================= Getting account =================");
  return res;
}

async function balanceByAddress(client, address) {
  const res = await client.stellar.balance_by_address(address);
  log("================= Getting balance =================");
  log(res);
  log("================= Getting balance =================");
}

async function assets(client, account) {
  const res = await client.stellar.assets(account);
  log("================= Getting assets =================");
  log(res);
  log("================= Getting assets =================");
}

async function sign(client, message) {
  const res = await client.stellar.sign(message);
  log("================= Signing message =================");
  log(res);
  log("================= Signing message =================");
}

async function pay(client, payment) {
  const res = await client.stellar.pay(payment);
  log("================= Paying =================");
  log(res);
  log("================= Paying =================");
}

async function deleteAccount(client, account) {
  const res = await client.stellar.delete(account);
  log("================= Deleting account =================");
  log(res);
  log("================= Deleting account =================");
}

async function main() {
  const grid3 = await getClient();

  const createAccount: StellarWalletCreateModel = {
    name: "stellarTest",
  };

  const account: StellarWalletInitModel = {
    name: "stellarTest2",
    secret: "SBCWGJ4A4IHDUUXPASQBL7VKGZGNRMVNV66GO5P6FU6Q4NDKHIHZFRKI",
  };

  const getAccount: BlockchainGetModel = {
    name: "stellarTest2",
  };

  const signMessage: BlockchainSignModel = {
    name: "stellarTest2",
    content: "message",
  };

  const deleteAccount1: BlockchainDeleteModel = {
    name: "stellarTest",
  };

  const deleteAccount2: BlockchainDeleteModel = {
    name: "stellarTest2",
  };

  //Create account
  const created_account = await create(grid3, createAccount);

  //Initialize account
  await init(grid3, account);

  //List accounts
  await list(grid3);

  //Check if the account exists
  await exist(grid3, getAccount);

  //Get account
  const test_account = await get(grid3, getAccount);

  //Get balance by account address
  const getBalance: StellarWalletBalanceByAddressModel = {
    address: test_account.public_key,
  };
  await balanceByAddress(grid3, { address: getBalance });

  //Get account assets
  await assets(grid3, getAccount);

  //Sign message
  await sign(grid3, signMessage);

  //Pay
  const transaction: StellarWalletTransferModel = {
    name: "stellarTest2",
    address_dest: created_account.public_key,
    amount: 1,
    description: "paytest",
    asset: "XLM",
  };

  await pay(grid3, transaction);

  //Delete account
  await deleteAccount(grid3, deleteAccount1);
  await deleteAccount(grid3, deleteAccount2);

  grid3.disconnect();
}

main();
