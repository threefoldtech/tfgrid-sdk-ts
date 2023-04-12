import {
    generateString,
    GridClient,
    TfchainCreateModel,
    TfchainWalletBalanceByAddressModel,
    TfchainWalletInitModel,
    TfchainWalletTransferModel,
} from "../../src";
import { getClient } from "../client_loader";
import { log, returnRelay } from "../utils";

jest.setTimeout(300000);

let gridClient: GridClient;

beforeAll(async () => {
    return (gridClient = await getClient());
});

test("TC1261 - TFChain: Create Account", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1261 - TFChain: Create Account
     Scenario:
        - Generate Test Data/Account Details.
        - Create the account.
        - Assert that the data of the created account
          matches the generated data.
    **********************************************/

    //Test Data
    const accountName = "Test" + generateString(5);
    const blockchainType = "tfchain";
    const relay = await returnRelay();

    //Create TFChain Account
    const account: TfchainCreateModel = {
        name: accountName,
        relay: relay,
    };
    const res = await gridClient.tfchain.create(account);
    log(res);

    expect(res.name).toBe(accountName);
    expect(res.public_key).toBeDefined();
    expect(res.mnemonic).toBeDefined();
    expect(res.twinId).toBeDefined();
    expect(res.blockchain_type).toBe(blockchainType);
});

test("TC1262 - TFChain: Import Account", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1262 - TFChain: Import Account
     Scenario:
        - Generate Test Data/Account Details.
        - Create the account.
        - Assert that the data of the created account
          matches the generated data.
        - Import the created Mnemonics with a new
          account name.
        - Assert that the returned address matches
          the address of the created account
    **********************************************/

    //Test Data
    const accountName = "Test" + generateString(5);
    const newAccountName = "Test" + generateString(5);
    const relay = await returnRelay();

    //Create Account
    const account: TfchainCreateModel = {
        name: accountName,
        relay: relay,
    };
    const res = await gridClient.tfchain.create(account);
    log(res);

    const accountMnemonic = res.mnemonic;

    //Import Account
    const importedAcc: TfchainWalletInitModel = {
        name: newAccountName,
        secret: accountMnemonic,
    };
    const newRes = await gridClient.tfchain.init(importedAcc);
    log(newRes);

    expect(newRes).toBe(res.public_key);
});

test("TC1263 - TFChain: Get Account", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1263 - TFChain: Get Account
     Scenario:
        - Generate Test Data/Account Details.
        - Create the account.
        - Assert that the data of the created account
          matches the generated data.
        - Get the data of the created account.
        - Assert that the returned data matches the data
          of the created account.
    **********************************************/

    //Test Data
    const accountName = "Test" + generateString(5);
    const blockchainType = "tfchain";
    const relay = await returnRelay();

    //Create Account
    const account: TfchainCreateModel = {
        name: accountName,
        relay: relay,
    };
    const res = await gridClient.tfchain.create(account);
    log(res);

    //Get Account
    const newRes = await gridClient.tfchain.get(account);
    log(newRes);

    expect(newRes.name).toBe(accountName);
    expect(newRes.public_key).toBe(res.public_key);
    expect(newRes.mnemonic).toBe(res.mnemonic);
    expect(newRes.blockchain_type).toBe(blockchainType);
});

test("TC1264 - TFChain: Check if Account exists", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1264 - TFChain: Check if Account exists
     Scenario:
        - Generate Test Data/Account Details.
        - Create the account.
        - Assert that the data of the created account
          matches the generated data.
        - Check if the created account exists.
        - Assert that the returned result is true.
    **********************************************/

    //Test Data
    const accountName = "Test" + generateString(5);
    const relay = await returnRelay();

    //Create Account
    const account: TfchainCreateModel = {
        name: accountName,
        relay: relay,
    };
    const res = await gridClient.tfchain.create(account);
    log(res);

    //Check if the account exists
    const newRes = await gridClient.tfchain.exist(account);
    log(newRes);

    expect(newRes).toBeTruthy();
});

test("TC1265 - TFChain: List Accounts", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1265 - TFChain: List Accounts
     Scenario:
        - Generate Test Data/Account Details.
        - Create the account.
        - Assert that the data of the created account
          matches the generated data.
        - List all Tfchain accounts.
        - Assert that the data of the created account
          matches the data of the last account in this
          list.
    **********************************************/

    //Test Data
    const accountName = "Test" + generateString(5);
    const blockchainType = "tfchain";
    const relay = await returnRelay();

    //Create Account
    const account: TfchainCreateModel = {
        name: accountName,
        relay: relay,
    };
    const res = await gridClient.tfchain.create(account);
    log(res);

    //List all Accounts
    const newRes = await gridClient.tfchain.list();
    log(newRes);

    expect(newRes[newRes.length - 1].name).toContain(accountName);
    expect(newRes[newRes.length - 1].public_key).toContain(res.public_key);
    expect(newRes[newRes.length - 1].blockchain_type).toContain(blockchainType);
});

test("TC1266 - TFChain: Get Account assets", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1266 - TFChain: Get Account assets
     Scenario:
        - Generate Test Data/Account Details.
        - Create the account.
        - Assert that the data of the created account
          matches the generated data.
        - Get the assets of the created account
        - Assert that the returned amount is greater
         than 0 and that the asset is TFT
    **********************************************/

    //Test Data
    const accountName = "Test" + generateString(5);
    const blockchainType = "tfchain";
    const relay = await returnRelay();

    //Create Account
    const account: TfchainCreateModel = {
        name: accountName,
        relay: relay,
    };
    const res = await gridClient.tfchain.create(account);
    log(res);

    //Get Account Assets
    const newRes = await gridClient.tfchain.assets(account);
    log(newRes);

    expect(newRes.name).toBe(accountName);
    expect(newRes.public_key).toBe(res.public_key);
    expect(newRes.blockchain_type).toBe(blockchainType);
    expect(newRes.assets[0]["amount"]).toBeGreaterThan(0);
    expect(newRes.assets[0]["asset"]).toBe("TFT");
});

test("TC1267 - TFChain: Get Account assets by address", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1267 - TFChain: Get Account assets by address
     Scenario:
        - Generate Test Data/Account Details.
        - Create the account.
        - Assert that the data of the created account
          matches the generated data.
        - Pass the address of the created account.
        - Get the assets of the created account by
          address.
        - Assert that the returned amount is greater
         than 0 and that the asset is TFT
    **********************************************/

    //Test Data
    const accountName = "Test" + generateString(5);
    const relay = await returnRelay();

    //Create Account
    const account: TfchainCreateModel = {
        name: accountName,
        relay: relay,
    };
    const res = await gridClient.tfchain.create(account);
    log(res);

    const accountAddress = res.public_key;

    //Get Account Assets By Address
    const getAssetsByAddress: TfchainWalletBalanceByAddressModel = {
        address: accountAddress,
    };
    const newRes = await gridClient.tfchain.balanceByAddress(getAssetsByAddress);
    log(newRes);

    expect(newRes["free"]).toBeGreaterThan(0);
});

test("TC1268 - TFChain: Transfer TFTs", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1268 - TFChain: Transfer TFTs
     Scenario:
        - Generate Test Data/Account Details for Two accounts.
        - Create the Two accounts.
        - Assert that the data of the created accounts
          matches the generated data.
        - Store the balance of the Two accounts.
        - Transfer 0.01TFT from the first account
          to the second account.
        - Assert that the balance of the first account
          decreased by 0.01TFT and the balance of the 
          second increased by 0.01TFT. 
    **********************************************/

    //Test Data
    const accountName = "Test" + generateString(5);
    const account2Name = "Test" + generateString(5);
    const relay = await returnRelay();
    const amount = 0.01;

    //Create the first account
    const account1: TfchainCreateModel = {
        name: accountName,
        relay: relay,
    };
    const res = await gridClient.tfchain.create(account1);
    log(res);

    //Get the balance of the first account
    const getAcc1Balance = await gridClient.tfchain.assets(account1);
    const acc1Balance = getAcc1Balance.assets[0]["amount"];

    //Create the first account
    const account2: TfchainCreateModel = {
        name: account2Name,
        relay: relay,
    };
    const NewRes = await gridClient.tfchain.create(account2);
    log(res);

    //Store the address of the second account
    const acc2address = NewRes.public_key;

    //Get the balance of the second account
    const getAcc2Balance = await gridClient.tfchain.assets(account2);
    const acc2Balance = getAcc2Balance.assets[0]["amount"];

    //Transfer 0.01 TFT from the first to the second account
    const transferTFT: TfchainWalletTransferModel = {
        name: accountName,
        address_dest: acc2address,
        amount: amount,
    };

    const transfer = await gridClient.tfchain.pay(transferTFT);
    log(transfer);

    //Verify that the address of the first account decreased by 0.01
    const getAcc1BalanceAfter = await gridClient.tfchain.assets(account1);
    log(getAcc1BalanceAfter);
    expect(getAcc1BalanceAfter.assets[0]["amount"]).toBeCloseTo(acc1Balance - amount);

    //Verify that the address of the second account increased by 0.01
    const getAcc2BalanceAfter = await gridClient.tfchain.assets(account2);
    log(getAcc2BalanceAfter);
    expect(getAcc2BalanceAfter.assets[0]["amount"]).toBeCloseTo(acc2Balance + amount);
});

afterEach(async () => {
    const accNames = await gridClient.tfchain.list();
    for (const name of accNames) {
        const res = await gridClient.tfchain.delete(name);
        log(res);
        expect(res).toBe("Deleted");
    }
});

afterAll(async () => {
    return await gridClient.disconnect();
});
