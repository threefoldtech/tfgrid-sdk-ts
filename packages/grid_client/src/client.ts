import { Client as RMBClient } from "@threefold/rmb_direct_client";
import { GridClientError, TwinNotExistError, ValidationError } from "@threefold/types";
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
import { BackendStorageType } from "./storage/backend";
import { KeypairType } from "./zos/deployment";

class GridClient {
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
  currency: modules.currency;
  utility: modules.utility;
  farmerbot: modules.farmerbot;
  farms: modules.farms;
  /**The `NetworkModule` class provides methods to interact with network operations.*/
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
      keepReconnectingToChain: clientOptions.keepReconnectingToChain ? clientOptions.keepReconnectingToChain : false,
    };

    if (
      this.clientOptions.network === NetworkEnv.dev ||
      this.clientOptions.network === NetworkEnv.qa ||
      this.clientOptions.network === NetworkEnv.test ||
      this.clientOptions.network === NetworkEnv.main
    ) {
      this.clientOptions.substrateURL = clientOptions.substrateURL;
      this.clientOptions.proxyURL = clientOptions.proxyURL;
      this.clientOptions.graphqlURL = clientOptions.graphqlURL;
      this.clientOptions.activationURL = clientOptions.activationURL;
      this.clientOptions.relayURL = clientOptions.relayURL;
    } else {
      throw new GridClientError(`Unknown NETWORK selected! Acceptable networks are [dev | qa | test | main ]`);
    }
  }
  async connect(): Promise<void> {
    const urls = this.getDefaultUrls(this.clientOptions.network);

    this.tfclient = new TFClient(
      urls.substrate,
      this.clientOptions.mnemonic,
      this.clientOptions.storeSecret!,
      this.clientOptions.keypairType,
      this.clientOptions.keepReconnectingToChain,
    );

    this.rmbClient = new RMBClient(
      urls.substrate,
      urls.relay,
      this.clientOptions.mnemonic,
      generateString(10),
      this.clientOptions.keypairType!,
      5,
    );

    await this.tfclient.connect();
    this.twinId = await this.tfclient.twins.getMyTwinId();
    if (!this.twinId) {
      throw new TwinNotExistError(
        `Couldn't find a user for the provided mnemonic on ${this.clientOptions.network} network.`,
      );
    }

    await this.testConnectionUrls(urls);
    this._connect();
    await this.rmbClient.connect();
    await migrateKeysEncryption.apply(this, [GridClient]);
  }

  _connect(): void {
    const urls = this.getDefaultUrls(this.clientOptions.network);
    const storePath = PATH.join(appPath, this.clientOptions.network, String(this.twinId));
    this.config = {
      network: this.clientOptions.network,
      mnemonic: this.clientOptions.mnemonic,
      storeSecret: this.clientOptions.storeSecret!,
      rmbClient: this.rmbClient,
      tfclient: this.tfclient,
      projectName: this.clientOptions.projectName!,
      backendStorageType: this.clientOptions.backendStorageType!,
      backendStorage: this.clientOptions.backendStorage,
      keypairType: this.clientOptions.keypairType!,
      storePath: storePath,
      graphqlURL: urls.graphql,
      relayURL: urls.relay,
      proxyURL: urls.rmbProxy,
      substrateURL: urls.substrate,
      activationURL: urls.activation,
      twinId: this.twinId,
      seed: this.clientOptions.seed,
      deploymentTimeoutMinutes: this.clientOptions.deploymentTimeoutMinutes!,
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
    const base = network === NetworkEnv.main ? "grid.tf" : `${network}.grid.tf`;
    const { proxyURL, relayURL, substrateURL, graphqlURL, activationURL } = this.clientOptions;
    const urls = {
      rmbProxy: proxyURL || `https://gridproxy.${base}`,
      relay: relayURL || `wss://relay.${base}`,
      substrate: substrateURL || `wss://tfchain.${base}/ws`,
      graphql: graphqlURL || `https://graphql.${base}/graphql`,
      activation: activationURL || `https://activation.${base}/activation/activate`,
    };

    return urls;
  }

  async disconnect(): Promise<void> {
    if (this.rmbClient) await this.rmbClient.disconnect();
    if (this.tfclient) await this.tfclient.disconnect();
  }

  async invoke(message, args) {
    const namespaces = message.split(".");
    if (namespaces.length > 2) {
      throw new ValidationError(`Message must include 2 parts only not ${namespaces.length}.`);
    }

    const method = namespaces.pop();

    const module_name = namespaces[0];
    if (!this.modules.includes(module_name)) {
      throw new GridClientError(`gridclient.${module_name} module doesn't exist.`);
    }
    const module = this[namespaces[0]];

    if (typeof module[method] !== "function") {
      throw new GridClientError(`${module_name}.${method} function doesn't exist.`);
    }

    if (isExposed(module, method) == false) {
      throw new GridClientError(`gridclient.${module_name}.${method} cannot be exposed.`);
    }
    return await module[method].apply(module, [args]);
  }
}

export { GridClient };
