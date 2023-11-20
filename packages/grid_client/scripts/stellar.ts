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
  try {
    const res = await client.stellar.create(account);
    log("================= Creating account =================");
    log(res);
    log("================= Creating account =================");
    return res;
  } catch (error) {
    log("Error while creating account " + error);
  }
}

async function init(client, account) {
  try {
    const res = await client.stellar.init(account);
    log("================= Initializing account =================");
    log(res);
    log("================= Initializing account =================");
  } catch (error) {
    log("Error while initializing account " + error);
  }
}

async function list(client) {
  try {
    const res = await client.stellar.list();
    log("================= Listing account =================");
    log(res);
    log("================= Listing account =================");
  } catch (error) {
    log("Error while listing account " + error);
  }
}

async function exist(client, account) {
  try {
    const res = await client.stellar.exist(account);
    log("================= Checking account =================");
    log(res);
    log("================= Checking account =================");
  } catch (error) {
    log("Error while checking account " + error);
  }
}

async function get(client, account) {
  try {
    const res = await client.stellar.get(account);
    log("================= Getting account =================");
    log(res);
    log("================= Getting account =================");
    return res;
  } catch (error) {
    log("Error while getting account " + error);
  }
}

async function balanceByAddress(client, address) {
  try {
    const res = await client.stellar.balance_by_address(address);
    log("================= Getting balance =================");
    log(res);
    log("================= Getting balance =================");
  } catch (error) {
    log("Error while getting balance " + error);
  }
}

async function assets(client, account) {
  try {
    const res = await client.stellar.assets(account);
    log("================= Getting assets =================");
    log(res);
    log("================= Getting assets =================");
  } catch (error) {
    log("Error while getting assets " + error);
  }
}

async function sign(client, message) {
  try {
    const res = await client.stellar.sign(message);
    log("================= Signing message =================");
    log(res);
    log("================= Signing message =================");
  } catch (error) {
    log("Error while signing message " + error);
  }
}

async function pay(client, payment) {
  try {
    const res = await client.stellar.pay(payment);
    log("================= Paying =================");
    log(res);
    log("================= Paying =================");
  } catch (error) {
    log("Error while paying " + error);
  }
}

async function deleteAccount(client, account) {
  try {
    const res = await client.stellar.delete(account);
    log("================= Deleting account =================");
    log(res);
    log("================= Deleting account =================");
  } catch (error) {
    log("Error while deleting account " + error);
  }
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
