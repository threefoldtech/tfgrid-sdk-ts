import { HTTPMessageBusClient } from "ts-rmb-http-client";
import { log } from "../../scripts/utils";

import { GridClient, NetworkEnv, BackendStorageType, KeypairType } from "../../src";

async function getClient() {
    const rmbClient = new HTTPMessageBusClient(0, "", "", "");
    const gridClient = new GridClient(NetworkEnv.main, "miss secret news run cliff lens exist clerk lucky cube fall soldier", "secret", rmbClient, "", BackendStorageType.auto, KeypairType.sr25519);
    await gridClient.connect();
    log(await gridClient.contracts.create_node({ hash: "87ac2a56b7c88bbab1a2c43a3bbec46d", public_ip: 2, data: "", node_id: 30 }
    ));
    gridClient.disconnect();
}
getClient();

