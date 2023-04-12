import { HTTPMessageBusClient } from "ts-rmb-http-client";

import { GridClient, NetworkEnv, BackendStorageType, KeypairType } from "../../src";

async function getClient() {
    const rmbClient = new HTTPMessageBusClient(0, "");
    const gridClient = new GridClient(NetworkEnv.dev, "miss secret news run cliff lens exist clerk lucky cube fall soldier", "secret", rmbClient, "", BackendStorageType.auto, KeypairType.sr25519);
    await gridClient.connect();
    console.log(await gridClient.gateway.list());
    gridClient.disconnect();
}
getClient();

