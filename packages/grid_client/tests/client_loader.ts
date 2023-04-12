import fs from "fs";
import path from "path";
import { env } from "process";

import { BackendStorageType, GridClient, KeypairType } from "../src";

const os = require("os");

const network = env.NETWORK;
const mnemonic = env.MNEMONIC;
const storeSecret = env.STORE_SECRET;
const ssh_key = fs.readFileSync(os.homedir() + "/.ssh/id_ed25519.pub", "utf-8");
let config;

if (!network || !mnemonic || !storeSecret || !ssh_key) {
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

export { config, getClient };
