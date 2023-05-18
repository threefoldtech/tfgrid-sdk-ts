import { ApiPromise, WsProvider } from "@polkadot/api";
import { Signer } from "@polkadot/api/types";
import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { Keyring } from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";
import { ISubmittableResult } from "@polkadot/types/types";
import { KeypairType } from "@polkadot/util-crypto/types";
import { waitReady } from "@polkadot/wasm-crypto";
import AwaitLock from "await-lock";
import { validateMnemonic } from "bip39";

import { Balances, QueryBalances } from "./balances";
import { Contracts, QueryContracts } from "./contracts";
import { QueryFarms } from "./farms";
import { KVStore } from "./kvstore";
import { Nodes } from "./nodes";
import { QueryPricingPolicies } from "./pricing_policies";
import { TermsAndConditions } from "./terms_and_conditions";
import { QueryTFTPrice } from "./tft_price";
import { QueryTwins, Twins } from "./twins";
import type { Extrinsic, ExtrinsicResult, PatchExtrinsicOptions, validatorFunctionType } from "./types";
import { Utility } from "./utility";
import { isEnvNode } from "./utils";

const SUPPORTED_KEYPAIR_TYPES = ["sr25519", "ed25519"];
interface ExtSigner {
  address: string;
  signer: Signer;
}

enum ExtrinsicState {
  ExtrinsicSuccess = "ExtrinsicSuccess",
  ExtrinsicFailed = "ExtrinsicFailed",
}

const BATCH_METHODS = ["batch", "batchAll"];
const SYSTEM = "system";
const UTILITY = "utility";

class QueryClient {
  static connections: Map<string, ApiPromise> = new Map();
  private connectingLock = new AwaitLock();
  api: ApiPromise;
  contracts: QueryContracts = new QueryContracts(this);
  balances: QueryBalances = new QueryBalances(this);
  farms: QueryFarms = new QueryFarms(this);
  tftPrice: QueryTFTPrice = new QueryTFTPrice(this);
  pricingPolicies: QueryPricingPolicies = new QueryPricingPolicies(this);
  twins: QueryTwins = new QueryTwins(this);
  constructor(public url: string) {
    if (!url) {
      throw Error("url should be provided");
    }
  }

  async loadKeyPairOrSigner(): Promise<void> {} // to be overridden in the full client

  private async wait(connection = true): Promise<void> {
    const start = new Date().getTime();
    while (new Date().getTime() < start + 10 * 1000) {
      if (connection && this.api.isConnected) return;
      if (!connection && !this.api.isConnected) return;
      await new Promise(f => setTimeout(f, 100));
    }
    if (connection) throw Error(`Client couldn't connect to ${this.url} after 10 seconds`);
  }

  async connect() {
    await this.loadKeyPairOrSigner();
    if (this.api && this.api.isConnected) return;
    if (Object.keys(QueryClient.connections).includes(this.url)) {
      this.api = QueryClient.connections[this.url];
      if (this.api && this.api.isConnected) return;
      await this.connectingLock.acquireAsync();
      await this.api.connect();
      await this.wait();
      this.api.on("disconnected", this.api.connect);
      this.connectingLock.release();
      return;
    }
    await this.connectingLock.acquireAsync();
    const provider = new WsProvider(this.url);
    this.api = await ApiPromise.create({ provider });
    await this.wait();
    QueryClient.connections[this.url] = this.api;

    this.api.on("disconnected", this.api.connect);
    this.connectingLock.release();

    if (isEnvNode()) {
      process.on("SIGTERM", this.disconnectAndExit.bind(this));
      process.on("SIGINT", this.disconnectAndExit.bind(this));
      process.on("SIGUSR1", this.disconnectAndExit.bind(this));
      process.on("SIGUSR2", this.disconnectAndExit.bind(this));
    } else {
      window.onbeforeunload = () => {
        return "";
      };
      window.onunload = this.disconnect.bind(this);
    }
  }

  async disconnect(): Promise<void> {
    if (this.api && this.api.isConnected) {
      console.log("disconnecting");
      this.api.off("disconnected", this.api.connect);
      await this.api.disconnect();
      await this.wait(false);
    }
  }

  async disconnectAndExit(): Promise<void> {
    // this should be only used by nodejs process
    await this.disconnect();
    process.exit(0);
  }

  async checkConnectionAndApply(func: (args: unknown[]) => unknown, args: unknown[]) {
    await this.connect();
    return await func.apply(this, args);
  }

  /**
   * Checks if the given section exists within the API events.
   *
   * @param {ApiPromise} api - The Polkadot API object.
   * @param {string} section - The section to check within the API events.
   * @returns {boolean} - True if the section exists within the API events, false otherwise.
   */
  private checkSection(api: ApiPromise, section: string): boolean {
    const sections = Object.keys(api.events);
    if (sections.includes(section)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Checks if the given method exists within the specified section of the API events.
   *
   * @param {ApiPromise} api - The Polkadot API object.
   * @param {string} section - The section of the API events to check.
   * @param {string} method - The method to check within the section.
   * @returns {boolean} - True if the method exists within the section, false otherwise.
   */
  private checkMethod(api, section, method) {
    const Methods = Object.keys(api.events[section]);
    if (Methods.includes(method)) {
      return true;
    } else return false;
  }

  /**
   * Listens for a specific event on the chain and resolves when the event matches the specified conditions.
   *
   * @param {ApiPromise} api - The API instance connected to the blockchain.
   * @param {string} section - The section of the event to listen for.
   * @param {string} method - The method of the event to listen for.
   * @param {string} key - The key to validate in the event data.
   * @param {string} value - The expected value of the validated key in the event data.
   * @param {validatorFunctionType} validator - The validator function to validate the event data.
   * @param {number} time - The timeout value in milliseconds. Default is 2 minutes.
   * @returns {Promise<object>} - A promise that resolves with the event data when the event matches the conditions.
   * @throws {Error} - If the section or method is not defined on the chain.
   * @rejects  If no response is received within the given time or if an error occurs during validation.
   */
  async listenForEvent(
    api: ApiPromise,
    section: string,
    method: string,
    key: string,
    value: string,
    validator: validatorFunctionType,
    time = 120000,
  ): Promise<object> {
    if (!this.checkSection(api, section)) {
      throw new Error(`<${section}> is not defined on the chain`);
    }
    if (!this.checkMethod(api, section, method)) {
      throw new Error(`<${method}> is not defined on the chain under ${section}`);
    }
    return new Promise(async (resolve, reject) => {
      const unsubscribe = (await api.query.system.events(events => {
        const timeout = setTimeout(() => {
          unsubscribe();
          reject(`Timeout: No response within ${time / 60000} minutes`);
        }, time);
        for (const { event } of events) {
          if (event.section === section && event.method === method) {
            try {
              if (validator(key, value, event.data)) {
                clearTimeout(timeout);
                resolve(event.data);
                return;
              }
            } catch (error) {
              reject(`Cannot reach "${key}" with error:\n\t${error}`);
              return;
            } finally {
              unsubscribe();
            }
          }
        }
      })) as unknown as () => void;
    });
  }
}

export interface ClientOptions {
  url: string;
  mnemonicOrSecret?: string;
  keypairType?: KeypairType;
  extSigner?: ExtSigner;
}

class Client extends QueryClient {
  static lock: AwaitLock = new AwaitLock();
  keypair: KeyringPair;
  address: string;
  contracts: Contracts = new Contracts(this);
  utility: Utility = new Utility(this);
  balances: Balances = new Balances(this);
  nodes: Nodes = new Nodes(this);
  termsAndConditions: TermsAndConditions = new TermsAndConditions(this);
  kvstore: KVStore = new KVStore(this);
  twins: Twins = new Twins(this);

  declare url: string;
  mnemonicOrSecret?: string;
  keypairType: KeypairType;
  extSigner?: ExtSigner;

  constructor(options: ClientOptions) {
    if (!options.url) throw Error("url should be provided");
    super(options.url);

    this.extSigner = options.extSigner;
    this.keypairType = options.keypairType || "sr25519";

    if (!SUPPORTED_KEYPAIR_TYPES.includes(this.keypairType)) {
      throw Error(
        `Keypair type ${this.keypairType} is not a valid type. Should be either of: ${SUPPORTED_KEYPAIR_TYPES}`,
      );
    }

    if ((options.mnemonicOrSecret && options.extSigner) || !(options.mnemonicOrSecret || options.extSigner)) {
      throw Error("mnemonicOrSecret or extension signer should be provided");
    }

    if (options.mnemonicOrSecret && !validateMnemonic(options.mnemonicOrSecret)) {
      throw Error("Invalid mnemonic! Must be bip39 compliant");
    }
    this.mnemonicOrSecret = options.mnemonicOrSecret;
  }

  async loadKeyPairOrSigner(): Promise<void> {
    if (this.mnemonicOrSecret && !this.address) {
      const keyring = new Keyring({ type: this.keypairType });
      await waitReady();

      try {
        this.keypair = keyring.addFromUri(this.mnemonicOrSecret);
        this.address = this.keypair.address;
      } catch (error) {
        throw Error("Invalid mnemonic or secret seed! Please check your input.");
      }
    }
    if (this.extSigner && !this.address) {
      this.address = this.extSigner.address;
    }
  }

  private async _applyExtrinsic<T>(
    extrinsic: SubmittableExtrinsic<"promise", ISubmittableResult>,
    resultSections: string[] = [""],
  ): Promise<T> {
    await this.connect();

    const promise = new Promise(async (resolve, reject) => {
      function callback(res) {
        if (res instanceof Error) {
          console.error(res);
          reject(res);
        }
        const { events = [], status } = res;
        const resultData: T[] = [];
        if (!(extrinsic.method.section === UTILITY && BATCH_METHODS.includes(extrinsic.method.method))) {
          resultSections.push(extrinsic.method.section);
        }
        if (status.isInBlock) {
          events.forEach(({ phase, event: { data, method, section } }) => {
            console.log(`phase: ${phase}, section: ${section}, method: ${method}, data: ${data}`);
            if (section === SYSTEM && method === ExtrinsicState.ExtrinsicFailed) {
              const errorIndex = parseInt(data.toJSON()[0].module.error.replace(/0+$/g, ""));
              reject(errorIndex);
            } else if (resultSections.includes(section)) {
              resultData.push(data.toPrimitive()[0]);
            } else if (section === SYSTEM && method === ExtrinsicState.ExtrinsicSuccess) {
              if (!(extrinsic.method.section === UTILITY && BATCH_METHODS.includes(extrinsic.method.method))) {
                if (resultData.length > 0) resolve(resultData[0]);
                else resolve(undefined);
              } else resolve(resultData);
            }
          });
        }
      }
      try {
        const nonce = await this.api.rpc.system.accountNextIndex(this.address);
        if (this.keypair) {
          extrinsic.signAndSend(this.keypair, { nonce }, callback);
        } else if (this.extSigner) {
          extrinsic.signAndSend(this.address, { nonce, signer: this.extSigner.signer }, callback);
        }
      } catch (e) {
        reject(e);
      }
    });
    return promise
      .then((res: any) => res as T)
      .catch(e => {
        throw Error(
          `Failed to apply ${JSON.stringify(extrinsic.method.toHuman())} due to error: ${
            Object.keys(this.api.errors[extrinsic.method.section])[+e]
          }`,
        );
      });
  }
  async applyExtrinsic<T>(
    extrinsic: SubmittableExtrinsic<"promise", ISubmittableResult>,
    resultSections: string[] = [""],
  ): Promise<T> {
    await Client.lock.acquireAsync();
    console.log("Lock acquired");
    let result;
    try {
      result = await this._applyExtrinsic<T>(extrinsic, resultSections);
    } finally {
      Client.lock.release();
      console.log("Lock released");
    }
    return result;
  }
  async applyAllExtrinsics<T>(extrinsics: SubmittableExtrinsic<"promise", ISubmittableResult>[]) {
    return this.utility.batchAll<T>(extrinsics);
  }

  patchExtrinsic<R>(extrinsic: Extrinsic, options: PatchExtrinsicOptions<R> = {}): ExtrinsicResult<R> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    (<any>extrinsic).apply = async () => {
      const res = await self.applyExtrinsic(extrinsic, options.resultSections);
      if (options.map) return options.map(res);
      return res;
    };
    return extrinsic as ExtrinsicResult<R>;
  }
}

export { Client, QueryClient, ExtSigner };
