import { Client as RMBClient } from "@threefold/rmb_direct_client";
import { GridClientErrors, TFChainErrors, ValidationError } from "@threefold/types";
import type AwaitLock from "await-lock";
import { validateMnemonic } from "bip39";
import * as PATH from "path";
import urlJoin from "url-join";

import { Graphql } from "./clients";
import { TFClient } from "./clients/tf-grid/client";
import { ClientOptions, GridClientConfig, NetworkEnv } from "./config";
import { migrateKeysEncryption, send, toHexSeed } from "./helpers";
import { isExposed } from "./helpers/expose";
import { formatErrorMessage, generateString } from "./helpers/utils";
import * as modules from "./modules/index";
import { appPath } from "./storage/backend";
import { BackendStorage, BackendStorageType } from "./storage/backend";
import { KeypairType } from "./zos/deployment";

class GridClient {
  static rmbClients: Map<string, RMBClient> = new Map();
  static connecting = new Set<string>();
  static migrationLock = new Map<string, AwaitLock>();
  static migrated = new Set<string>();
  config: GridClientConfig;
  rmbClient: RMBClient;
  tfclient: TFClient;
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
  dao: modules.dao;
  bridge: modules.bridge;
  modules: string[] = [];

  readonly _mnemonic: string;

  constructor(public clientOptions: ClientOptions) {
    if (!clientOptions.storeSecret && validateMnemonic(clientOptions.mnemonic)) {
      this._mnemonic = clientOptions.mnemonic;
    }

    const hexSeed = toHexSeed(clientOptions.mnemonic);

    this.clientOptions = {
      mnemonic: hexSeed,
      network: clientOptions.network,
      storeSecret: clientOptions.storeSecret ? clientOptions.storeSecret : hexSeed,
      projectName: clientOptions.projectName ? clientOptions.projectName : "",
      keypairType: clientOptions.keypairType ? clientOptions.keypairType : KeypairType.sr25519,
      backendStorageType: clientOptions.backendStorageType ? clientOptions.backendStorageType : BackendStorageType.auto,
      deploymentTimeoutMinutes: clientOptions.deploymentTimeoutMinutes ? clientOptions.deploymentTimeoutMinutes : 10,
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

    this.tfclient = new TFClient(
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
      await this.tfclient.connect();
      await this.rmbClient.connect();

      await this.testConnectionUrls(urls);

      if (BackendStorage.isEnvNode()) {
        process.on("SIGTERM", this.disconnectAndExit);
        process.on("SIGINT", this.disconnectAndExit);
        process.on("SIGUSR1", this.disconnectAndExit);
        process.on("SIGUSR2", this.disconnectAndExit);
        process.removeAllListeners();
      } else {
        window.onbeforeunload = () => {
          return "";
        };
        window.onunload = this.disconnect;
      }
    }
    try {
      this.twinId = await this.tfclient.twins.getMyTwinId();
      if (!this.twinId) {
        throw Error(`Couldn't find a user for the provided mnemonic on ${this.clientOptions.network} network.`);
      }
    } catch (e) {
      console.log(e);
      throw new TFChainErrors.TFChainError(
        `Couldn't get the user twin for the provided mnemonic on ${this.clientOptions.network} network.`,
      );
    }
    this._connect();

    await migrateKeysEncryption.apply(this, [GridClient]);

    GridClient.connecting.delete(key);
  }

  _connect(): void {
    const urls = this.getDefaultUrls(this.clientOptions.network);
    const storePath = PATH.join(appPath, this.clientOptions.network, String(this.twinId));
    this.config = {
      network: this.clientOptions.network,
      mnemonic: this.clientOptions.mnemonic,
      storeSecret: this.clientOptions.storeSecret,
      rmbClient: this.rmbClient,
      tfclient: this.tfclient,
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
      this[module] = new modules[module](this.config);
      this.modules.push(module);
    }
  }

  async testConnectionUrls(urls: Record<string, string>): Promise<void> {
    try {
      await send("get", urlJoin(urls.rmbProxy, "version"), "", {});
    } catch (err) {
      console.log(err.message);
      (err as Error).message = formatErrorMessage("Failed to connect to Grid proxy server.", err);
      throw err;
    }

    try {
      const gql = new Graphql(urls.graphql);
      await gql.query("query { __typename }");
    } catch (err) {
      console.log(err.message);
      (err as Error).message = formatErrorMessage("Failed to connect to Graphql server.", err);
      throw err;
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
    if (this.tfclient) await this.tfclient.disconnect();
    for (const key of Object.keys(GridClient.rmbClients)) {
      await GridClient.rmbClients[key].close();
    }
  }

  async disconnectAndExit(): Promise<void> {
    if (this.tfclient) await this.tfclient.disconnect();
    for (const key of Object.keys(GridClient.rmbClients)) {
      await GridClient.rmbClients[key].close();
    }
    process.exit(0);
  }

  async invoke(message, args) {
    const namespaces = message.split(".");
    if (namespaces.length > 2) {
      throw new ValidationError(`Message must include 2 parts only not ${namespaces.length}.`);
    }

    const method = namespaces.pop();

    const module_name = namespaces[0];
    if (!this.modules.includes(module_name)) {
      throw new GridClientErrors.GridClientError(`gridclient.${module_name} module doesn't exist.`);
    }
    const module = this[namespaces[0]];

    if (typeof module[method] !== "function") {
      throw new GridClientErrors.GridClientError(`${module_name}.${method} function doesn't exist.`);
    }

    if (isExposed(module, method) == false) {
      throw new GridClientErrors.GridClientError(`gridclient.${module_name}.${method} cannot be exposed.`);
    }
    return await module[method].apply(module, [args]);
  }
}

export { GridClient };
