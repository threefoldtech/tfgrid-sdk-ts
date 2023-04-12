// import fs from "fs";
// import { HTTPMessageBusClient } from "ts-rmb-http-client";

// import { appPath, BackendStorageType, GridClient, KeypairType, NetworkEnv } from "./src";

// async function getClient() {
//     const rmbClient = new HTTPMessageBusClient(0, "", "", "");
//     while (true) {
//         const gridClient = new GridClient(
//             NetworkEnv.dev,
//             "miss secret news run cliff lens exist clerk lucky cube fall soldier",
//             "secret",
//             rmbClient,
//             "",
//             BackendStorageType.auto,
//             KeypairType.sr25519,
//         );
//         await gridClient.connect();
//         console.log(await gridClient.balance.getMyBalance());
//         await new Promise(f => setTimeout(f, 30000));
//     }
// }
// getClient();
