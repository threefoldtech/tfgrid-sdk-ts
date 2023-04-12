import fs from "fs";
import path from "path";
import { env } from "process";

import { GridClient } from "../src";

const network = env.NETWORK;
const mnemonic = env.MNEMONIC;
const storeSecret = env.STORE_SECRET;
const ssh_key = env.SSH_KEY;
let config;

if (network === undefined || mnemonic === undefined || storeSecret === undefined || ssh_key === undefined) {
    console.log("Credentials not all found in env variables. Loading all credentials from default config.json...");
    config = JSON.parse(fs.readFileSync(path.join(__dirname, "./config.json"), "utf-8"));
} else {
    console.log("Credentials loaded from env variables...");
    config = {
        network: network,
        mnemonic: mnemonic,
        storeSecret: storeSecret,
        ssh_key: ssh_key,
    };
}

async function getClient(): Promise<GridClient> {
    const gridClient = new GridClient({
        network: config.network,
        mnemonic: config.mnemonic,
        storeSecret: config.storeSecret,
    });
    await gridClient.connect();
    return gridClient;
}

async function getNewClient(): Promise<GridClient> {
    const gridClient = new GridClient({
        network: config.network,
        mnemonic: config.mnemonic,
        storeSecret: config.mnemonic,
    });
    await gridClient.connect();
    return gridClient;
}

export { config, getClient, getNewClient };
