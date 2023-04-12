import * as secp from "@noble/secp256k1";
import { Keyring } from "@polkadot/keyring";
import { waitReady } from "@polkadot/wasm-crypto";
import axios from "axios";
import { generateMnemonic } from "bip39";
import * as bip39 from "bip39";
import { Buffer } from "buffer";
import MD5 from "crypto-js/md5";
import { backOff } from "exponential-backoff";
import * as PATH from "path";

import { Balance, TFClient } from "../clients";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { appPath, BackendStorage, StorageUpdateAction } from "../storage/backend";
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
    constructor(config: GridClientConfig) {
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

    async save(name: string, mnemonic: string) {
        const [path, data] = await this._load();
        if (data[name]) {
            throw Error(`An account with the same name ${name} already exists`);
        }
        await this.backendStorage.update(path, name, mnemonic);
    }

    @expose
    @validateInput
    async init(options: TfchainWalletInitModel) {
        const client = new TFClient(this.substrateURL, options.secret, this.storeSecret, this.keypairType);
        await client.connect();
        if (!client.isConnected()) {
            throw Error(`could not connect account with given mnemonics`);
        }
        await this.save(options.name, client.mnemonic);
        return client.client.address;
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
        return {
            name: options.name,
            public_key: client.client.address,
            mnemonic: mnemonics,
            blockchain_type: blockchainType.tfchain,
        };
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
            await this.backendStorage.update(path, options.name, options.secret, StorageUpdateAction.add);
            return client.client.address;
        } catch (e) {
            throw Error(`could not update account mnemonics: ${e}`);
        }
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
            accounts.push({
                name: name,
                public_key: client.client.address,
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
        const accountBalance = new Balance(client);
        const balance = await accountBalance.get(client.client.address);
        return {
            name: options.name,
            public_key: client.client.address,
            blockchain_type: blockchainType.tfchain,
            assets: [
                {
                    amount: balance.free,
                    asset: "TFT",
                },
            ],
        };
    }

    @expose
    @validateInput
    async balanceByAddress(options: TfchainWalletBalanceByAddressModel) {
        const client = new TFClient(this.substrateURL, this.mnemonic, this.storeSecret, this.keypairType);
        await client.connect();
        const accountBalance = new Balance(client);
        return await accountBalance.get(options.address);
    }

    @expose
    @validateInput
    async pay(options: TfchainWalletTransferModel) {
        const mnemonics = await this.getMnemonics(options.name);
        const sourceClient = new TFClient(this.substrateURL, mnemonics, this.storeSecret, this.keypairType);
        const accountBalance = new Balance(sourceClient);
        try {
            await accountBalance.transfer(options.address_dest, options.amount);
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
        await this.backendStorage.update(path, options.name, "", StorageUpdateAction.delete);
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

    async createAccount(relay: string) {
        const mnemonics = generateMnemonic();
        const client = new TFClient(this.substrateURL, mnemonics, this.storeSecret, this.keypairType);
        await client.connect();
        await axios.post(this.activationURL, {
            substrateAccountID: client.client.address,
        });
        await backOff(() => client.terms.acceptTermsAndConditions("https://library.threefold.me/info/legal/#/"), {
            delayFirstAttempt: true,
            startingDelay: 1000,
            maxDelay: 5000,
            timeMultiple: 1.25,
        });
        const ret = await client.twins.create(relay);

        return {
            public_key: client.client.address,
            mnemonic: mnemonics,
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
