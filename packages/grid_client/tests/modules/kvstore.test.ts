import { generateString, GridClient, KVStoreGetModel, KVStoreSetModel } from "../../src";
import { getClient } from "../client_loader";
import { log } from "../utils";

jest.setTimeout(300000);

let gridClient: GridClient;

beforeAll(async () => {
    return (gridClient = await getClient());
});

const key = generateString(15);

test("TC1238 - KVStore: Use TFChain KVStore", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1238 - KVStore: Use TFChain KVStore
     Scenario:
        - Generate Test Data.
        - Set Key/Value.
        - List all key for this specific twin.
        - Get the data of a Specific Key.
        - Remove a Specific Key.
    **********************************************/

    //Test Data
    const value1 = generateString(15);
    const value2 = generateString(15);
    const kv = {
        key1: value1,
        key2: value2,
    };

    const setKV: KVStoreSetModel = {
        key,
        value: JSON.stringify(kv),
    };

    const setRes = await gridClient.kvstore.set(setKV);
    log(setRes);

    const listRes = await gridClient.kvstore.list();
    log(listRes);
    expect(listRes).toContain(key);

    const getKV: KVStoreGetModel = {
        key,
    };
    const getRes = await gridClient.kvstore.get(getKV);
    log(getRes);
    expect(getRes).toContain(kv.key1);
    expect(getRes).toContain(value1);
    expect(getRes).toContain(kv.key2);
    expect(getRes).toContain(value2);
});

afterEach(async () => {
    await gridClient.kvstore.remove({ key });
});

afterAll(async () => {
    return await gridClient.disconnect();
});
