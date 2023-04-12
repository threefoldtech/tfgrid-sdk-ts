import {
    AlgorandAccountAssetsFromAddressModel,
    AlgorandAccountCreateModel,
    AlgorandAccountInitModel,
    generateString,
    GridClient,
} from "../../src";
import { getClient } from "../client_loader";
import { log } from "../utils";

jest.setTimeout(300000);

let gridClient: GridClient;

beforeAll(async () => {
    return (gridClient = await getClient());
});

test("TC1247 - Algorand: Create Account", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1247 - Algorand: Create Account
     Scenario:
        - Generate Test Data/Account Details.
        - Create the account.
        - Assert that the data of the created account
          matches the generated data.
    **********************************************/

    //Test Data
    const accountName = "Test" + generateString(5);
    const blockchainType = "algorand";

    //Create Alogrand Account
    const account: AlgorandAccountCreateModel = {
        name: accountName,
    };

    const res = await gridClient.algorand.create(account);
    log(res);

    expect(res.name).toBe(accountName);
    expect(res.public_key).toBeDefined();
    expect(res.mnemonic).toBeDefined();
    expect(res.blockchain_type).toBe(blockchainType);
});

test("TC1248 - Algorand: Import Account", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1248 - Algorand: Import Account
     Scenario:
        - Generate Test Data/Account Details.
        - Create the account.
        - Assert that the data of the created account
          matches the generated data.
        - Import the created Mnemonics with a new
          account name.
        - Verify that the returned address matches 
          the address of the created account
    **********************************************/

    //Test Data
    const accountName = "Test" + generateString(5);
    const newAccountName = "Test" + generateString(5);
    const blockchainType = "algorand";

    //Create Account
    const account: AlgorandAccountCreateModel = {
        name: accountName,
    };
    const res = await gridClient.algorand.create(account);
    log(res);

    const accountMnemonic = res.mnemonic;

    //Import Account
    const importedAcc: AlgorandAccountInitModel = {
        name: newAccountName,
        secret: accountMnemonic,
    };
    const newRes = await gridClient.algorand.init(importedAcc);
    log(newRes);

    expect(newRes).toBe(res.public_key);
});

test("TC1249 - Algorand: Get Account", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1249 - Algorand: Get Account
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
    const blockchainType = "algorand";

    //Create Account
    const account: AlgorandAccountCreateModel = {
        name: accountName,
    };
    const res = await gridClient.algorand.create(account);
    log(res);

    //Get Account
    const newRes = await gridClient.algorand.get(account);
    log(newRes);

    expect(newRes.name).toBe(accountName);
    expect(newRes.public_key).toBe(res.public_key);
    expect(newRes.mnemonic).toBe(res.mnemonic);
    expect(newRes.blockchain_type).toBe(blockchainType);
});

test("TC1250 - Algorand: Check if Account exists", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1250 - Algorand: Check if Account exists
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
    const blockchainType = "algorand";

    //Create Account
    const account: AlgorandAccountCreateModel = {
        name: accountName,
    };
    const res = await gridClient.algorand.create(account);
    log(res);

    //Check if the account exists.
    const newRes = await gridClient.algorand.exist(account);
    log(newRes);
    expect(newRes).toBeTruthy();
});

test("TC1251 - Algorand: List Accounts", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1251 - Algorand: List Accounts
     Scenario:
        - Generate Test Data/Account Details.
        - Create the account.
        - Assert that the data of the created account
          matches the generated data.
        - List all Algorand accounts.
        - Assert that the data of the created account
          matches the data of the last account in this
          list.
    **********************************************/

    //Test Data
    const accountName = "Test" + generateString(5);
    const blockchainType = "algorand";

    //Create Account
    const account: AlgorandAccountCreateModel = {
        name: accountName,
    };
    const res = await gridClient.algorand.create(account);
    log(res);

    //List all accounts
    const newRes = await gridClient.algorand.list();
    log(newRes);

    expect(newRes[newRes.length - 1].name).toContain(accountName);
    expect(newRes[newRes.length - 1].public_key).toContain(res.public_key);
    expect(newRes[newRes.length - 1].blockchain_type).toContain(blockchainType);
});

test("TC1252 - Algorand: Get Account assets", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1252 - Algorand: Get Account assets
     Scenario:
        - Generate Test Data/Account Details.
        - Create the account.
        - Assert that the data of the created account
          matches the generated data.
        - Get the assets of the created account
    **********************************************/

    //Test Data
    const accountName = "Test" + generateString(5);
    const blockchainType = "algorand";

    //Create Account
    const account: AlgorandAccountCreateModel = {
        name: accountName,
    };
    const res = await gridClient.algorand.create(account);
    log(res);

    //Get Account Assets
    const newRes = await gridClient.algorand.assets(account);
    log(newRes);

    expect(newRes.name).toBe(accountName);
    expect(newRes.public_key).toBe(res.public_key);
    expect(newRes.blockchain_type).toBe(blockchainType);
    expect(newRes.assets).toBeDefined();
});

test("TC1253 - Algorand: Get Account assets by address", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1253 - Algorand: Get Account assets by address
     Scenario:
        - Generate Test Data/Account Details.
        - Create the account.
        - Assert that the data of the created account
          matches the generated data.
        - Pass the address of the created account.
        - Get the assets of the created account by
          address.
    **********************************************/

    //Test Data
    const accountName = "Test" + generateString(5);
    const blockchainType = "algorand";

    //Create Account
    const account: AlgorandAccountCreateModel = {
        name: accountName,
    };
    const res = await gridClient.algorand.create(account);
    log(res);

    const accountAddress = res.public_key;

    //Get Account Assets By Address
    const getAssetsByAddress: AlgorandAccountAssetsFromAddressModel = {
        address: accountAddress,
    };
    const newRes = await gridClient.algorand.assetsByAddress(getAssetsByAddress);
    log(newRes);

    expect(newRes).toBeDefined();
});

afterEach(async () => {
    const accNames = await gridClient.algorand.list();
    for (const name of accNames) {
        const res = await gridClient.algorand.delete(name);
        log(res);
        expect(res).toBe("Deleted");
    }
});

afterAll(async () => {
    return await gridClient.disconnect();
});
