import "reflect-metadata";
import { HTTPMessageBusClient } from "ts-rmb-http-client";

import { GridClient } from "../../src/client";
import { NetworkEnv } from "../../src/config";
import { BackendStorageType } from "../../src/storage/backend";
import { KeypairType } from "../../src/";

async function getClient() {
    const rmbClient = new HTTPMessageBusClient(0, "", "", "");
    const gridClient = new GridClient(NetworkEnv.dev, "miss secret news run cliff lens exist clerk lucky cube fall soldier", "secret", rmbClient, "", BackendStorageType.auto, KeypairType.sr25519);
    await gridClient.connect();
    console.log(await gridClient.contracts.listContractsByAddress({ address: "5EFkv5SZqRRBEL9sxXd7RmzSQk7JCpxgWh6TiJjEq5X77Sb9" }));
    console.log(await gridClient.contracts.listContractsByTwinId({ twinId: 3 }));
    // console.log(await gridClient.contracts.cancel({ id: 3489 }));
    console.log(await gridClient.contracts.listMyContracts());
    // console.log(">>> delete:", await gridClient.contracts.cancelMyContracts());
    // console.log(await gridClient.contracts.listMyContracts());


    gridClient.disconnect();
}
getClient();
