#!/usr/bin/env node
import "reflect-metadata";

import { GridClient, isExposed } from "@threefold/grid_client";
import express, { Express } from "express";
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
class HttpServer {
    server: Express;
    router;
    port: number;
    constructor(port = 3000) {
        this.server = express();

        this.server.use(express.urlencoded({ extended: false }));
        this.server.use(express.json());

        this.server.use((req, res, next) => {
            // set the CORS policy
            res.header("Access-Control-Allow-Origin", "*");
            // set the CORS headers
            res.header("Access-Control-Allow-Headers", "origin, X-Requested-With,Content-Type,Accept, Authorization");
            // set the CORS method headers
            if (req.method === "OPTIONS") {
                //res.header('Access-Control-Allow-Methods', 'POST');
                return res.status(200).json({});
            }
            next();
        });

        this.router = express.Router();
        this.port = port;
    }

    handle(gridClient, module, method) {
        this.router.post(`/${module}/${method}`, async (req, res, next) => {
            const payload = req.body;

            console.log(`Executing Method: ${method} in Module: ${module} with Payload: ${payload}`);

            let result;
            try {
                result = await gridClient[module][method](payload);
            } catch (error) {
                return res.status(400).send({ error: error.message });
            }

            return res.status(200).send({ result });
        });
    }

    async register() {
        const gridClient = new GridClient({
            network: config.network,
            mnemonic: config.mnemonic,
            storeSecret: config.storeSecret,
            keypairType: config.keypairType,
        });

        await gridClient.connect();

        for (const module of gridClient.modules) {
            const props = Object.getPrototypeOf(gridClient[module]);
            const methods = Object.getOwnPropertyNames(props);
            for (const method of methods) {
                if (isExposed(gridClient[module], method) == true) {
                    this.handle(gridClient, module, method);
                }
            }
        }

        this.server.use("/", this.router);
    }

    run() {
        // ping-pong the server
        this.server.use("/ping", (req, res, next) => res.status(404).json("pong"));

        /** Error handling */
        this.server.use((req, res, next) => {
            const error = new Error("not found");
            return res.status(404).json({
                message: error.message,
            });
        });

        this.server.listen(this.port, () => console.log(`The server is running on port ${this.port}`));
    }
}

if (!(config.network && config.mnemonic && config.storeSecret)) {
    throw new Error(`Invalid config. Please fill the config.json file with the correct data`);
}

const server = new HttpServer();
server
    .register()
    .then(() => {
        server.run();
    })
    .catch(err => {
        console.log(err);
    });

export default HttpServer;
