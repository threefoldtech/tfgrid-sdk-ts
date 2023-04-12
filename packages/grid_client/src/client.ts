import { Client as RMBClient } from "@threefold/rmb_direct_client";
import * as PATH from "path";
import urlJoin from "url-join";

import { TFClient } from "./clients/tf-grid/client";
import { ClientOptions, GridClientConfig, NetworkEnv } from "./config";
import { send } from "./helpers";
import { isExposed } from "./helpers/expose";
import { generateString } from "./helpers/utils";
import * as modules from "./modules/index";
import { appPath } from "./storage/backend";
import { BackendStorage, BackendStorageType } from "./storage/backend";
import { KeypairType } from "./zos/deployment";

class GridClient {
    static config: GridClientConfig;
    static rmbClients: Record<string, RMBClient> = {};
    static connecting = new Set<string>();
    rmbClient: RMBClient;
    machines: modules.machines;
    k8s: modules.k8s;
    zdbs: modules.zdbs;
    gateway: modules.gateway;
    qsfs_zdbs: modules.qsfs_zdbs;
    zos: modules.zos;
    contracts: modules.contracts;
    twins: modules.twins;
    kvstore: modules.kvstore;
    balance: modules.balance;
    capacity: modules.capacity;
    twinId: number;
    nodes: modules.nodes;
    algorand: modules.algorand;
    tfchain: modules.tfchain;
    stellar: modules.stellar;
    blockchain: modules.blockchain;
    calculator: modules.calculator;
    utility: modules.utility;
    farmerbot: modules.farmerbot;
    farms: modules.farms;
    networks: modules.networks;
    modules: string[] = [];

    constructor(public clientOptions?: ClientOptions) {
        this.clientOptions = {
            mnemonic: clientOptions.mnemonic,
            network: clientOptions.network,
            storeSecret: clientOptions.storeSecret ? clientOptions.storeSecret : clientOptions.mnemonic,
            projectName: clientOptions.projectName ? clientOptions.projectName : "",
            keypairType: clientOptions.keypairType ? clientOptions.keypairType : KeypairType.sr25519,
            backendStorageType: clientOptions.backendStorageType
                ? clientOptions.backendStorageType
                : BackendStorageType.auto,
            deploymentTimeoutMinutes: clientOptions.deploymentTimeoutMinutes
                ? clientOptions.deploymentTimeoutMinutes
                : 10,
        };
        if (
            !(
                this.clientOptions.network === NetworkEnv.dev ||
                this.clientOptions.network === NetworkEnv.qa ||
                this.clientOptions.network === NetworkEnv.test ||
                this.clientOptions.network === NetworkEnv.main
            )
        ) {
            this.clientOptions.network = NetworkEnv.custom;
            this.clientOptions.substrateURL = clientOptions.substrateURL;
            this.clientOptions.proxyURL = clientOptions.proxyURL;
            this.clientOptions.graphqlURL = clientOptions.graphqlURL;
            this.clientOptions.activationURL = clientOptions.activationURL;
            this.clientOptions.relayURL = clientOptions.relayURL;
        }
    }
    async connect(): Promise<void> {
        const urls = this.getDefaultUrls(this.clientOptions.network);
        const key = `${urls.substrate}:${this.clientOptions.mnemonic}:${this.clientOptions.keypairType}`;

        const isConnecting = GridClient.connecting.has(key);
        GridClient.connecting.add(key); // Add Client to connecting set.

        const tfclient = new TFClient(
            urls.substrate,
            this.clientOptions.mnemonic,
            this.clientOptions.storeSecret,
            this.clientOptions.keypairType,
        );
        if (Object.keys(GridClient.rmbClients).includes(key)) {
            this.rmbClient = GridClient.rmbClients[key];
        } else {
            this.rmbClient = new RMBClient(
                urls.substrate,
                urls.relay,
                this.clientOptions.mnemonic,
                generateString(10),
                this.clientOptions.keypairType,
                5,
            );
            GridClient.rmbClients[key] = this.rmbClient;
        }

        if (!isConnecting) {
            await tfclient.connect();
            this.rmbClient.api = tfclient.client.api;
            try {
                await this.rmbClient.connect();
            } catch (e) {
                throw Error(e.message);
            }

            await this.testConnectionUrls(urls);

            if (BackendStorage.isEnvNode()) {
                process.on("SIGTERM", this.disconnectAndExit);
                process.on("SIGINT", this.disconnectAndExit);
                process.on("SIGUSR1", this.disconnectAndExit);
                process.on("SIGUSR2", this.disconnectAndExit);
            } else {
                window.onbeforeunload = () => {
                    return "";
                };
                window.onunload = this.disconnect;
            }
        }

        try {
            this.twinId = await tfclient.twins.getMyTwinId();
            if (!this.twinId) {
                throw Error(`Couldn't find a user for the provided mnemonic on ${this.clientOptions.network} network.`);
            }
        } catch (e) {
            console.log(e);
            throw Error(`Couldn't find a user for the provided mnemonic on ${this.clientOptions.network} network.`);
        }
        this._connect();
        GridClient.connecting.delete(key);
    }

    _connect(): void {
        const urls = this.getDefaultUrls(this.clientOptions.network);
        const storePath = PATH.join(appPath, this.clientOptions.network, String(this.twinId));
        GridClient.config = {
            network: this.clientOptions.network,
            mnemonic: this.clientOptions.mnemonic,
            storeSecret: this.clientOptions.storeSecret,
            rmbClient: this.rmbClient,
            projectName: this.clientOptions.projectName,
            backendStorageType: this.clientOptions.backendStorageType,
            backendStorage: this.clientOptions.backendStorage,
            keypairType: this.clientOptions.keypairType,
            storePath: storePath,
            graphqlURL: urls.graphql,
            proxyURL: urls.rmbProxy,
            substrateURL: urls.substrate,
            activationURL: urls.activation,
            twinId: this.twinId,
            seed: this.clientOptions.seed,
            deploymentTimeoutMinutes: this.clientOptions.deploymentTimeoutMinutes,
        };
        for (const module of Object.getOwnPropertyNames(modules).filter(item => typeof modules[item] === "function")) {
            if (module.includes("Model")) {
                continue;
            }
            this[module] = new modules[module](GridClient.config);
            this.modules.push(module);
        }
    }

    async testConnectionUrls(urls: Record<string, string>): Promise<void> {
        try {
            await send("get", urlJoin(urls.rmbProxy, "version"), "", {});
        } catch (err) {
            console.log(err.message);
            throw Error("failed to connect to Grid proxy server");
        }

        try {
            await send("get", urls.graphql, "", {});
        } catch (err) {
            console.log(err.message);
            throw Error("failed to connect to Graphql server");
        }
    }

    getDefaultUrls(network: NetworkEnv): Record<string, string> {
        const urls = { rmbProxy: "", substrate: "", graphql: "", activation: "", relay: "" };
        if (network === NetworkEnv.dev) {
            urls.rmbProxy = "https://gridproxy.dev.grid.tf";
            urls.relay = "wss://relay.dev.grid.tf";
            urls.substrate = "wss://tfchain.dev.grid.tf/ws";
            urls.graphql = "https://graphql.dev.grid.tf/graphql";
            urls.activation = "https://activation.dev.grid.tf/activation/activate";
        } else if (network === NetworkEnv.test) {
            urls.rmbProxy = "https://gridproxy.test.grid.tf";
            urls.relay = "wss://relay.test.grid.tf";
            urls.substrate = "wss://tfchain.test.grid.tf/ws";
            urls.graphql = "https://graphql.test.grid.tf/graphql";
            urls.activation = "https://activation.test.grid.tf/activation/activate";
        } else if (network === NetworkEnv.qa) {
            urls.rmbProxy = "https://gridproxy.qa.grid.tf";
            urls.relay = "wss://relay.qa.grid.tf";
            urls.substrate = "wss://tfchain.qa.grid.tf/ws";
            urls.graphql = "https://graphql.qa.grid.tf/graphql";
            urls.activation = "https://activation.qa.grid.tf/activation/activate";
        } else if (network === NetworkEnv.main) {
            urls.rmbProxy = "https://gridproxy.grid.tf";
            urls.relay = "wss://relay.grid.tf";
            urls.substrate = "wss://tfchain.grid.tf/ws";
            urls.graphql = "https://graph.grid.tf/graphql";
            urls.activation = "https://activation.grid.tf/activation/activate";
        } else {
            urls.rmbProxy = this.clientOptions.proxyURL;
            urls.relay = this.clientOptions.relayURL;
            urls.substrate = this.clientOptions.substrateURL;
            urls.graphql = this.clientOptions.graphqlURL;
            urls.activation = this.clientOptions.activationURL;
        }
        return urls;
    }

    async disconnect(): Promise<void> {
        for (const key of Object.keys(TFClient.clients)) {
            await TFClient.clients[key].disconnect();
        }
        for (const key of Object.keys(GridClient.rmbClients)) {
            await GridClient.rmbClients[key].close();
        }
    }

    async disconnectAndExit(): Promise<void> {
        // this should be only used by nodejs process
        for (const key of Object.keys(TFClient.clients)) {
            await TFClient.clients[key].disconnect();
        }
        for (const key of Object.keys(GridClient.rmbClients)) {
            await GridClient.rmbClients[key].close();
        }
        process.exit(0);
    }

    async invoke(message, args) {
        const namespaces = message.split(".");
        if (namespaces.length > 2) {
            throw `Message must include 2 parts only not ${namespaces.length}`;
        }

        const method = namespaces.pop();

        const module_name = namespaces[0];
        if (!this.modules.includes(module_name)) {
            throw `gridclient.${module_name} module doesn't exist`;
        }
        const module = this[namespaces[0]];

        if (typeof module[method] !== "function") {
            throw `${module_name}.${method} function doesn't exist`;
        }

        if (isExposed(module, method) == false) {
            throw `gridclient.${module_name}.${method} cannot be exposed`;
        }
        return await module[method].apply(module, [args]);
    }
}

export { GridClient };
