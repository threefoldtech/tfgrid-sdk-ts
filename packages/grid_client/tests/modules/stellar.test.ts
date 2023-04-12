import {
    generateString,
    GridClient,
    StellarWalletBalanceByAddressModel,
    StellarWalletCreateModel,
    StellarWalletInitModel,
} from "../../src";
import { getClient } from "../client_loader";
import { log } from "../utils";

jest.setTimeout(300000);

let gridClient: GridClient;

beforeAll(async () => {
    return (gridClient = await getClient());
});

test("TC1254 - Stellar: Create Account", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1254 - Stellar: Create Account
     Scenario:
        - Generate Test Data/Account Details.
        - Create the account.
        - Assert that the data of the created account
          matches the generated data.
    **********************************************/

    //Test Data
    const accountName = "Test" + generateString(5);
    const blockchainType = "stellar";

    //Create Stellar Account
    const account: StellarWalletCreateModel = {
        name: accountName,
    };
    const res = await gridClient.stellar.create(account);
    log(res);

    expect(res.name).toBe(accountName);
    expect(res.public_key).toBeDefined();
    expect(res.secret).toBeDefined();
    expect(res.blockchain_type).toBe(blockchainType);
});

test("TC1255 - Stellar: Import Account", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1255 - Stellar: Import Account
     Scenario:
        - Generate Test Data/Account Details.
        - Create the account.
        - Assert that the data of the created account
          matches the generated data.
        - Import the created account with a new
          account name.
        - Assert that the returned address matches
          the address of the created account
    **********************************************/

    //Test Data
    const accountName = "Test" + generateString(5);
    const newAccountName = "Test" + generateString(5);
    const blockchainType = "stellar";

    //Create Account
    const account: StellarWalletCreateModel = {
        name: accountName,
    };
    const res = await gridClient.stellar.create(account);
    log(res);

    const accountSecret = res.secret;

    //Import Account
    const importedAcc: StellarWalletInitModel = {
        name: newAccountName,
        secret: accountSecret,
    };
    const newRes = await gridClient.stellar.init(importedAcc);
    log(newRes);

    expect(newRes).toBe(res.public_key);
});

test("TC1256 - Stellar: Get Account", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1256 - Stellar: Get Account
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
    const blockchainType = "stellar";

    //Create Account
    const account: StellarWalletCreateModel = {
        name: accountName,
    };
    const res = await gridClient.stellar.create(account);
    log(res);

    //Get Account
    const newRes = await gridClient.stellar.get(account);
    log(newRes);

    expect(newRes.name).toBe(accountName);
    expect(newRes.public_key).toBe(res.public_key);
    expect(newRes.secret).toBe(res.secret);
    expect(newRes.blockchain_type).toBe(blockchainType);
});

test("TC1257 - Stellar: Check if Account exists", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1257 - Stellar: Check if Account exists
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
    const blockchainType = "stellar";

    //Create Account
    const account: StellarWalletCreateModel = {
        name: accountName,
    };
    const res = await gridClient.stellar.create(account);
    log(res);

    //Check if the account exists.
    const newRes = await gridClient.stellar.exist(account);
    log(newRes);

    expect(newRes).toBeTruthy();
});

test("TC1258 - Stellar: List Accounts", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1258 - Stellar: List Accounts
     Scenario:
        - Generate Test Data/Account Details.
        - Create the account.
        - Assert that the data of the created account
          matches the generated data.
        - List all Stellar accounts.
        - Assert that the data of the created account
          matches the data of the last account in this
          list.
    **********************************************/

    //Test Data
    const accountName = "Test" + generateString(5);
    const blockchainType = "stellar";

    //Create Account
    const account: StellarWalletCreateModel = {
        name: accountName,
    };
    const res = await gridClient.stellar.create(account);
    log(res);

    //List all accounts
    const newRes = await gridClient.stellar.list();
    log(newRes);

    expect(newRes[newRes.length - 1].name).toContain(accountName);
    expect(newRes[newRes.length - 1].public_key).toContain(res.public_key);
    expect(newRes[newRes.length - 1].blockchain_type).toContain(blockchainType);
});

test("TC1259 - Stellar: Get Account assets", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1259 - Stellar: Get Account assets
     Scenario:
        - Generate Test Data/Account Details.
        - Create the account.
        - Assert that the data of the created account
          matches the generated data.
        - Get the assets of the created account
    **********************************************/

    //Test Data
    const accountName = "Test" + generateString(5);
    const blockchainType = "stellar";

    //Create Account
    const account: StellarWalletCreateModel = {
        name: accountName,
    };
    const res = await gridClient.stellar.create(account);
    log(res);

    //Get account assets
    const newRes = await gridClient.stellar.assets(account);
    log(newRes);

    expect(newRes.name).toBe(accountName);
    expect(newRes.public_key).toBe(res.public_key);
    expect(newRes.blockchain_type).toBe(blockchainType);
    expect(newRes.assets[0]["amount"]).toBeDefined();
    expect(newRes.assets[0]["asset"]).toBe("XLM");
});

test("TC1260 - Stellar: Get Account assets by address", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1260 - Stellar: Get Account assets by address
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
    const blockchainType = "stellar";

    //Create Account
    const account: StellarWalletCreateModel = {
        name: accountName,
    };
    const res = await gridClient.stellar.create(account);
    log(res);

    const accountAddress = res.public_key;

    //Get Account Assets By Address
    const getAssetsByAddress: StellarWalletBalanceByAddressModel = {
        address: accountAddress,
    };
    const newRes = await gridClient.stellar.balance_by_address(getAssetsByAddress);
    log(newRes);

    expect(newRes[0]["amount"]).toBeDefined();
    expect(newRes[0]["asset"]).toBe("XLM");
});

afterEach(async () => {
    const accNames = await gridClient.stellar.list();
    for (const name of accNames) {
        const res = await gridClient.stellar.delete(name);
        log(res);
        expect(res).toBe("Deleted");
    }
});

afterAll(async () => {
    return await gridClient.disconnect();
});
