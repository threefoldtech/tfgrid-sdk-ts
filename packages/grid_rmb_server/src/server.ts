#!/usr/bin/env node
import "reflect-metadata";

import { GridClient, isExposed } from "@threefold/grid_client";
import { MessageBusServer } from "@threefold/rmb_peer_server";
import fs from "fs";
import path from "path";

const argv = process.argv.slice(2);
let config_file = path.join(__dirname, "./config.json");
argv.forEach((value, ind) => {
    if (value == "--config" || value == "-c") {
        config_file = argv[ind + 1];
    }
});
const config = JSON.parse(fs.readFileSync(config_file, "utf-8"));
class Server {
    server: MessageBusServer;
    gridClient: GridClient;
    constructor(port = 6379) {
        this.server = new MessageBusServer(port);
        this.gridClient = new GridClient({
            network: config.network,
            mnemonic: config.mnemonic,
            storeSecret: config.storeSecret,
            keypairType: config.keypairType,
        });
    }

    async wrapFunc(message, payload) {
        const parts = message.cmd.split(".");
        const module = parts[1];
        const method = parts[2];
        const obj = this.gridClient[module];
        console.log(`Executing Method: ${method} in Module: ${module} with Payload: ${payload}`);
        return await obj[method](JSON.parse(payload));
    }

    async register() {
        await this.gridClient.connect();
        for (const module of this.gridClient.modules) {
            const props = Object.getPrototypeOf(this.gridClient[module]);
            const methods = Object.getOwnPropertyNames(props);
            for (const method of methods) {
                if (isExposed(this.gridClient[module], method) == true) {
                    this.server.withHandler(`twinserver.${module}.${method}`, this.wrapFunc.bind(this));
                }
            }
        }
    }
    run() {
        this.server.run();
    }
}

if (!(config.network && config.mnemonic && config.storeSecret)) {
    throw new Error(`Invalid config. Please fill the config.json file with the correct data`);
}

const server = new Server();
server
    .register()
    .then(() => {
        server.run();
    })
    .catch(err => {
        console.log(err);
    });
