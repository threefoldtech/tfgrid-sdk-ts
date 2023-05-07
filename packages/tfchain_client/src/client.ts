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
import type { Extrinsic, ExtrinsicResult, PatchExtrinsicOptions } from "./types";
import { Utility } from "./utility";
import { isEnvNode } from "./utils";

const SUPPORTED_KEYPAIR_TYPES = ["sr25519", "ed25519"];

interface ExtSigner {
  address: string;
  signer: Signer;
}

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
        if (!(extrinsic.method.section === "utility" && ["batch", "batchAll"].includes(extrinsic.method.method))) {
          resultSections.push(extrinsic.method.section);
        }
        if (status.isInBlock) {
          events.forEach(({ phase, event: { data, method, section } }) => {
            console.log(`phase: ${phase}, section: ${section}, method: ${method}, data: ${data}`);
            if (section === "system" && method === "ExtrinsicFailed") {
              const errorIndex = parseInt(data.toJSON()[0].module.error.replace(/0+$/g, ""));
              reject(errorIndex);
            } else if (resultSections.includes(section)) {
              resultData.push(data.toPrimitive()[0]);
            } else if (section === "system" && method === "ExtrinsicSuccess") {
              if (
                !(extrinsic.method.section === "utility" && ["batch", "batchAll"].includes(extrinsic.method.method))
              ) {
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
