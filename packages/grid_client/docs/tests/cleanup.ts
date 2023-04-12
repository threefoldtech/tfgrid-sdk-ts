import fs from "fs";

import { HTTPMessageBusClient } from "ts-rmb-http-client";

import { GridClient, appPath, KeypairType, BackendStorageType, NetworkEnv } from "../../src";


async function getClient() {
    const rmbClient = new HTTPMessageBusClient(0, "", "", "");
    const gridClient = new GridClient(NetworkEnv.dev, "miss secret news run cliff lens exist clerk lucky cube fall soldier", "secret", rmbClient, "", BackendStorageType.auto, KeypairType.sr25519);
    await gridClient.connect();
    // await gridClient.contracts.cancel({id:2817})
    const deletedContracts = await gridClient.contracts.cancelMyContracts();
    console.log("deletedContracts:", deletedContracts);
    const keys = await gridClient.kvstore.removeAll();
    console.log("deletedKeys:", keys);
    if (fs.existsSync(appPath)) {
        fs.rmSync(appPath, { recursive: true });
    }
    gridClient.disconnect();
}
getClient();
