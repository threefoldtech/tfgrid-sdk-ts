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
import { Nodes, QueryNodes } from "./nodes";
import { QueryPricingPolicies } from "./pricing_policies";
import { TermsAndConditions } from "./terms_and_conditions";
import { QueryTFTPrice } from "./tft_price";
import { QueryTFTBridge } from "./tftBridge";
import { QueryTwins, Twins } from "./twins";
import type { Extrinsic, ExtrinsicResult, PatchExtrinsicOptions, validatorFunctionType } from "./types";
import { Utility } from "./utility";
import { isEnvNode, isValidSeed } from "./utils";

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
  tftBridge: QueryTFTBridge = new QueryTFTBridge(this);
  tftPrice: QueryTFTPrice = new QueryTFTPrice(this);
  pricingPolicies: QueryPricingPolicies = new QueryPricingPolicies(this);
  twins: QueryTwins = new QueryTwins(this);
  nodes: QueryNodes = new QueryNodes(this);
  __disconnectHandler = this.newProvider.bind(this);

  constructor(public url: string) {}

  async loadKeyPairOrSigner(): Promise<void> {} // to be overridden in the full client
  checkInputs(): void {
    if (!this.url) {
      throw Error("url should be provided");
    }
  }
  private async wait(connection = true): Promise<void> {
    const start = new Date().getTime();
    while (new Date().getTime() < start + 10 * 1000) {
      if (connection && this.api.isConnected) return;
      if (!connection && !this.api.isConnected) return;
      await new Promise(f => setTimeout(f, 100));
    }
    if (connection) throw Error(`Client couldn't connect to ${this.url} after 10 seconds`);
  }

  async newProvider() {
    await this.disconnect.bind(this);
    if (this.api) {
      delete this.api;
    }

    const provider = new WsProvider(this.url);
    this.api = await ApiPromise.create({ provider });
    await this.wait();
    QueryClient.connections[this.url] = this.api;
    this.api.on("disconnected", this.__disconnectHandler);
  }

  async connect() {
    this.checkInputs();
    await this.loadKeyPairOrSigner();
    if (this.api && this.api.isConnected) return;
    if (Object.keys(QueryClient.connections).includes(this.url)) {
      this.api = QueryClient.connections[this.url];
      if (this.api && this.api.isConnected) return;
      await this.connectingLock.acquireAsync();
      await this.newProvider();
      this.connectingLock.release();
      return;
    }

    await this.connectingLock.acquireAsync();
    await this.newProvider();
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
      this.api.off("disconnected", this.__disconnectHandler);
      await this.api.disconnect();
      await this.wait(false);
    }
  }

  async disconnectAndExit(): Promise<void> {
    // this should be only used by nodejs process
    await this.disconnect();
    process.exit(0);
  }

  /**
   * Checks if the given section exists within the API events.
   *
   * @param {string} section - The section to check within the API events.
   * @returns {boolean} - True if the section exists within the API events, false otherwise.
   */
  private checkSection(section: string): boolean {
    const sections = Object.keys(this.api.events);
    if (sections.includes(section)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Checks if the given method exists within the specified section of the API events.
   *
   * @param {string} section - The section of the API events to check.
   * @param {string} method - The method to check within the section.
   * @returns {boolean} - True if the method exists within the section, false otherwise.
   */
  private checkMethod(section, method) {
    const methods = Object.keys(this.api.events[section]);
    if (methods.includes(method)) {
      return true;
    } else return false;
  }

  /**
   * Listens for a specific event on the chain and resolves when the event matches the specified conditions.
   *
   * @param {string} section - The section of the event to listen for.
   * @param {string} method - The method of the event to listen for.
   * @param {validatorFunctionType} validator - The validator function to validate the event data.
   * @param {number} timeoutInMinutes - The timeout value in minutes. Default is 2 minutes.
   * @returns {Promise<object>} - A promise that resolves with the event data when the event matches the conditions.
   * @throws {Error} - If the section or method is not defined on the chain.
   * @rejects  If no response is received within the given time or if an error occurs during validation.
   */
  async listenForEvent<T>(
    section: string,
    method: string,
    validator: validatorFunctionType,
    timeoutInMinutes = 2,
  ): Promise<T> {
    await this.connect();
    if (!this.checkSection(section)) {
      throw new Error(`<${section}> is not defined on the chain`);
    }
    if (!this.checkMethod(section, method)) {
      throw new Error(`<${method}> is not defined on the chain under ${section}`);
    }

    return new Promise<T>(async (resolve, reject) => {
      const unsubscribe = (await this.api.query.system.events(events => {
        const timeout = setTimeout(() => {
          unsubscribe();
          reject(`Timeout: No response within ${timeoutInMinutes} minutes`);
        }, timeoutInMinutes * 60000);

        for (const { event } of events) {
          if (event.section === section && event.method === method) {
            try {
              if (validator(event.data)) {
                clearTimeout(timeout);
                resolve(event.data as unknown as T);
                return;
              }
            } catch (error) {
              reject(`Cannot reach the key with error:\n\t${error}`);
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
  kvStore: KVStore = new KVStore(this);
  twins: Twins = new Twins(this);

  declare url: string;
  mnemonicOrSecret?: string;
  keypairType: KeypairType;
  extSigner?: ExtSigner;

  constructor(options: ClientOptions) {
    super(options.url);
    this.extSigner = options.extSigner;
    this.keypairType = options.keypairType || "sr25519";
    this.mnemonicOrSecret = options.mnemonicOrSecret;
  }

  checkInputs(): void {
    if (!this.url) throw Error("url should be provided");
    if (!SUPPORTED_KEYPAIR_TYPES.includes(this.keypairType)) {
      throw Error(
        `Keypair type ${this.keypairType} is not a valid type. Should be either of: ${SUPPORTED_KEYPAIR_TYPES}`,
      );
    }

    if ((this.mnemonicOrSecret && this.extSigner) || !(this.mnemonicOrSecret || this.extSigner)) {
      throw Error("mnemonicOrSecret or extension signer should be provided");
    }
    if (this.mnemonicOrSecret) {
      if (!validateMnemonic(this.mnemonicOrSecret)) {
        if (this.mnemonicOrSecret.includes(" "))
          // seed shouldn't have spaces
          throw Error("Invalid mnemonic! Must be bip39 compliant");

        if (!this.mnemonicOrSecret.startsWith("0x"))
          throw Error("Invalid secret seed. secret seed should starts with 0x");
        const secret = this.mnemonicOrSecret.substring(2);
        if (secret.length !== 64) throw Error("Invalid secret length. Secret length should be 64");
        if (!isValidSeed(secret)) throw Error("Invalid secret seed");
      }
    }
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
    resultSections: string[] = [],
    resultEvents: string[] = [],
  ): Promise<T> {
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
              try {
                const [dispatchError, _] = data;
                const errorIndex = dispatchError.asModule.error[0];
                reject(errorIndex);
              } catch (e) {
                reject(e);
              }
            } else if (
              resultSections.includes(section) &&
              (resultEvents.length === 0 || (resultEvents.length > 0 && resultEvents.includes(method)))
            ) {
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
          await extrinsic.signAndSend(this.keypair, { nonce }, callback);
        } else if (this.extSigner) {
          await extrinsic.signAndSend(this.address, { nonce, signer: this.extSigner.signer }, callback);
        }
      } catch (e) {
        reject(e);
      }
    });
    return promise
      .then((res: any) => res as T)
      .catch(e => {
        let section: string = extrinsic.method.section;
        if (
          extrinsic.method.section === UTILITY &&
          BATCH_METHODS.includes(extrinsic.method.method) &&
          resultSections.length > 0
        )
          section = resultSections[0];
        throw Error(
          `Failed to apply ${JSON.stringify(extrinsic.method.toHuman())} due to error: ${
            Object.keys(this.api.errors[section])[+e] ?? e
          }`,
        );
      });
  }
  async applyExtrinsic<T>(
    extrinsic: SubmittableExtrinsic<"promise", ISubmittableResult>,
    resultSections: string[] = [""],
    resultEvents: string[] = [],
  ): Promise<T> {
    await Client.lock.acquireAsync();
    console.log("Lock acquired");
    let result;
    try {
      result = await this._applyExtrinsic<T>(extrinsic, resultSections, resultEvents);
    } finally {
      Client.lock.release();
      console.log("Lock released");
    }
    return result;
  }
  async applyAllExtrinsics<T>(extrinsics: ExtrinsicResult<T>[]) {
    return this.utility.batchAll<T>(extrinsics);
  }

  patchExtrinsic<R>(extrinsic: Extrinsic, options: PatchExtrinsicOptions<R> = {}): ExtrinsicResult<R> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    (<any>extrinsic).apply = async () => {
      const res = await self.applyExtrinsic(extrinsic, options.resultSections, options.resultEvents);
      if (options.map) return options.map(res);
      return res;
    };
    (<any>extrinsic).resultEvents = options.resultEvents;
    (<any>extrinsic).resultSections = options.resultSections;

    return extrinsic as ExtrinsicResult<R>;
  }
}

export { Client, QueryClient, ExtSigner };
