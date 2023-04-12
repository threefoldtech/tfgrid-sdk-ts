import "reflect-metadata";
import fs from "fs";
import path from "path";
import { HTTPMessageBusClient } from "ts-rmb-http-client";
import { MessageBusClient } from "ts-rmb-redis-client";

import { GridClient } from "./src/client";
import { BackendStorageType } from "./src/storage/backend";
import { KeypairType } from "./src/clients/tf-grid/client";

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "./server/config.json"), "utf-8"));

async function getClient() {
    const rmbClient = new HTTPMessageBusClient(0, config.rmb_proxy);
    const gridClient = new GridClient(config.network, config.mnemonic, "secret", rmbClient, "", BackendStorageType.auto, KeypairType.sr25519);
    await gridClient.connect();
    console.log(gridClient.rmbClient);
    const set1 = gridClient.kvstore.set({ key: "ahmed2", value: "lol" });
    const set2 = gridClient.kvstore.set({ key: "ahmed3", value: "lol" });
    await Promise.all([set1, set2]);
    console.log("get:", await gridClient.kvstore.get({ key: "ahmed2111" }));
    console.log("list:", await gridClient.kvstore.list());
    console.log("del:", await gridClient.kvstore.remove({ key: "ahmed2" }));
    gridClient.disconnect();
}
getClient();
