import { HTTPMessageBusClient } from "ts-rmb-http-client";

import { GridClient, NetworkEnv, BackendStorageType, KeypairType, Nodes } from "./src";

async function getClient() {
    const rmbClient = new HTTPMessageBusClient(0, "");
    const gridClient = new GridClient(NetworkEnv.test, "fiscal play spin all describe because stem disease coral call bronze please", "secret", rmbClient, "", BackendStorageType.auto, KeypairType.ed25519);
    await gridClient.connect();
    const nodes = new Nodes(GridClient.config.graphqlURL, GridClient.config.rmbClient["proxyURL"]);
    console.log(await nodes.getFarmIdFromFarmName("freefarm"));
    gridClient.disconnect();
}
getClient();

