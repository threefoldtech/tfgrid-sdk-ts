import { HTTPMessageBusClient } from "ts-rmb-http-client";

import { GridClient, NetworkEnv, BackendStorageType, KeypairType } from "./src";

async function getClient() {
    const rmbClient = new HTTPMessageBusClient(0, "");
    const gridClient = new GridClient(NetworkEnv.dev, "miss secret news run cliff lens exist clerk lucky cube fall soldier", "secret", rmbClient, "", BackendStorageType.auto, KeypairType.sr25519);
    await gridClient.connect();
    // console.log((await gridClient.capacity.getFarms()).length);
    // console.log((await gridClient.capacity.getNodes()).length);
    // console.log((await gridClient.capacity.checkFarmHasFreePublicIps({ farmId: 1 })));
    // console.log((await gridClient.capacity.getNodesByFarmId({ farmId: 1 })));
    // console.log((await gridClient.capacity.getNodeFreeResources({ nodeId: 8 })));
    // console.log((await gridClient.capacity.getFarmIdFromFarmName({ farmName: "freefarm" })));
    console.log((await gridClient.capacity.filterNodes({ cru: -1 })).length);


    gridClient.disconnect();
}
getClient();

