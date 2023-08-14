import { Keyring } from "@polkadot/keyring";
import { waitReady } from "@polkadot/wasm-crypto";
import axios from "axios";
import { generateMnemonic } from "bip39";
import { Buffer } from "buffer";
import MD5 from "crypto-js/md5";
import * as PATH from "path";

import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { appPath, BackendStorage, BackendStorageType, StorageUpdateAction } from "../storage/backend";
import { KeypairType } from "../zos";
import blockchainInterface, { blockchainType } from "./blockchainInterface";
import {
  BlockchainAssetsModel,
  BlockchainCreateResultModel,
  BlockchainDeleteModel,
  BlockchainGetModel,
  BlockchainGetResultModel,
  BlockchainListResultModel,
  BlockchainSignModel,
  TfchainCreateModel,
  TfchainWalletBalanceByAddressModel,
  TfchainWalletInitModel,
  TfchainWalletTransferModel,
} from "./models";

class TFChain implements blockchainInterface {
  fileName = "tfchain.json";
  backendStorage: BackendStorage;
  substrateURL: string;
  activationURL: string;
  mnemonic: string;
  storeSecret: string;
  keypairType: KeypairType;
  network: string;
  tfClient: TFClient;

  constructor(public config: GridClientConfig) {
    this.backendStorage = new BackendStorage(
      config.backendStorageType,
      config.substrateURL,
      config.mnemonic,
      config.storeSecret,
      config.keypairType,
      config.backendStorage,
      config.seed,
    );
    this.substrateURL = config.substrateURL;
    this.activationURL = config.activationURL;
    this.mnemonic = config.mnemonic;
    this.storeSecret = config.storeSecret as string;
    this.keypairType = config.keypairType;
    this.network = config.network;
    this.tfClient = new TFClient(
      this.config.substrateURL,
      this.config.mnemonic,
      this.config.storeSecret,
      this.config.keypairType,
    );
  }

  getPath() {
    return PATH.join(appPath, this.fileName);
  }

  //loading
  async _load() {
    const path = this.getPath();
    let data = await this.backendStorage.load(path);
    if (!data) {
      data = {};
    }
    return [path, data];
  }

  private async saveIfKVStoreBackend(extrinsics) {
    if (this.config.backendStorageType === BackendStorageType.tfkvstore && extrinsics && extrinsics.length > 0) {
      extrinsics = extrinsics.filter(e => e !== undefined);
      if (extrinsics.length > 0) {
        await this.tfClient.connect();
        await this.tfClient.applyAllExtrinsics(extrinsics);
      }
    }
  }

  async save(name: string, mnemonic: string) {
    const [path, data] = await this._load();
    if (data[name]) {
      throw Error(`An account with the same name ${name} already exists`);
    }
    const updateOperations = await this.backendStorage.update(path, name, mnemonic);
    await this.saveIfKVStoreBackend(updateOperations);
  }

  @expose
  @validateInput
  async init(options: TfchainWalletInitModel) {
    const client = new TFClient(this.substrateURL, options.secret, this.storeSecret, this.keypairType);
    await client.connect();
    await this.save(options.name, client.mnemonic);
    return client.address;
  }

  async getMnemonics(name: string) {
    const [, data] = await this._load();
    if (!data[name]) {
      throw Error(`An account with the name ${name} does not exist.`);
    }
    return data[name];
  }

  @expose
  @validateInput
  async get(options: BlockchainGetModel): Promise<BlockchainGetResultModel> {
    const mnemonics = await this.getMnemonics(options.name);
    const client = new TFClient(this.substrateURL, mnemonics, this.storeSecret, this.keypairType);
    await client.connect();
    const account = {
      name: options.name,
      public_key: client.address,
      mnemonic: mnemonics,
      blockchain_type: blockchainType.tfchain,
    };
    return account;
  }

  @expose
  @validateInput
  async update(options: TfchainWalletInitModel) {
    if (!(await this.exist(options))) {
      throw Error(`Couldn't find an account with name ${options.name}`);
    }
    const client = new TFClient(this.substrateURL, options.secret, this.storeSecret, this.keypairType);
    await client.connect();

    try {
      const path = this.getPath();
      const updateOperations = await this.backendStorage.update(
        path,
        options.name,
        options.secret,
        StorageUpdateAction.add,
      );
      await this.saveIfKVStoreBackend(updateOperations);
    } catch (e) {
      throw Error(`could not update account mnemonics: ${e}`);
    }
    return client.address;
  }

  @expose
  @validateInput
  async exist(options: BlockchainGetModel) {
    return (await this.list()).map(account => account.name == options.name).includes(true);
  }

  @expose
  @validateInput
  async list(): Promise<BlockchainListResultModel[]> {
    const [, data] = await this._load();
    const accounts = [];

    for (const name of Object.keys(data)) {
      const mnemonics = await this.getMnemonics(name);
      const client = new TFClient(this.substrateURL, mnemonics, this.storeSecret, this.keypairType);
      await client.connect();
      accounts.push({
        name: name,
        public_key: client.address,
        blockchain_type: blockchainType.tfchain,
      });
    }
    return accounts;
  }

  @expose
  @validateInput
  async assets(options: BlockchainGetModel): Promise<BlockchainAssetsModel> {
    if (!(await this.exist(options))) {
      throw Error(`Couldn't find an account with name ${options.name}`);
    }
    const mnemonics = await this.getMnemonics(options.name);
    const client = new TFClient(this.substrateURL, mnemonics, this.storeSecret, this.keypairType);
    await client.connect();
    const balance = await client.balances.get({ address: client.address });
    const assets = {
      name: options.name,
      public_key: client.address,
      blockchain_type: blockchainType.tfchain,
      assets: [
        {
          amount: balance.free,
          asset: "TFT",
        },
      ],
    };
    return assets;
  }

  @expose
  @validateInput
  async balanceByAddress(options: TfchainWalletBalanceByAddressModel) {
    const client = new TFClient(this.substrateURL, this.mnemonic, this.storeSecret, this.keypairType);
    await client.connect();
    const balance = await client.balances.get(options);
    return balance;
  }

  @expose
  @validateInput
  async pay(options: TfchainWalletTransferModel) {
    const mnemonics = await this.getMnemonics(options.name);
    const sourceClient = new TFClient(this.substrateURL, mnemonics, this.storeSecret, this.keypairType);
    await sourceClient.connect();
    try {
      await (await sourceClient.balances.transfer({ address: options.address_dest, amount: options.amount })).apply();
    } catch (e) {
      throw Error(`Could not complete transfer transaction: ${e}`);
    }
  }

  @expose
  @validateInput
  async delete(options: BlockchainDeleteModel) {
    if (!(await this.exist(options))) {
      throw Error(`Couldn't find an account with name ${options.name}`);
    }
    const path = this.getPath();
    const updateOperations = await this.backendStorage.update(path, options.name, "", StorageUpdateAction.delete);
    await this.saveIfKVStoreBackend(updateOperations);
    return "Deleted";
  }

  @expose
  @validateInput
  async create(options: TfchainCreateModel): Promise<BlockchainCreateResultModel> {
    if (await this.exist({ name: options.name })) {
      throw Error(`An account with the same name ${options.name} already exists`);
    }
    const createdAccount = await this.createAccount(options.relay as string);
    await this.init({ name: options.name, secret: createdAccount.mnemonic });

    return {
      name: options.name,
      public_key: createdAccount.public_key,
      mnemonic: createdAccount.mnemonic,
      twinId: createdAccount.twinId,
      blockchain_type: blockchainType.tfchain,
    };
  }

  async createAccount(relay: string, disconnect = false) {
    const mnemonic = generateMnemonic();
    return this.activateAccountAndCreateTwin(mnemonic, relay, disconnect);
  }

  async activateAccountAndCreateTwin(mnemonic: string, relay: string, disconnect = false) {
    const client = new TFClient(this.substrateURL, mnemonic, this.storeSecret, this.keypairType);
    await client.connect();
    await axios.post(this.activationURL, {
      substrateAccountID: client.address,
    });
    const start = new Date().getTime();
    let balance = await client.balances.getMyBalance();
    while (new Date().getTime() < start + 10 * 1000) {
      balance = await client.balances.getMyBalance();
      if (balance.free > 0) break;
      await new Promise(f => setTimeout(f, 1000));
    }
    if (balance.free <= 0) {
      throw Error("Couldn't activate the newly created account");
    }
    await (
      await client.termsAndConditions.accept({ documentLink: "https://library.threefold.me/info/legal/#/" })
    ).apply();
    const ret = await (await client.twins.create({ relay })).apply();
    if (disconnect) await client.disconnect();
    return {
      public_key: client.address,
      mnemonic,
      twinId: ret.id,
    };
  }

  @expose
  @validateInput
  async sign(options: BlockchainSignModel): Promise<string> {
    const mnemonics = await this.getMnemonics(options.name);
    const hash = MD5(options.content);
    const message_bytes = Uint8Array.from(Buffer.from(hash.toString(), "hex"));
    const keyr = new Keyring({ type: this.keypairType });
    const key = keyr.addFromMnemonic(mnemonics);
    await waitReady();
    const signed = key.sign(message_bytes);
    return Buffer.from(signed).toString("hex");
  }
}

export { TFChain as tfchain };
