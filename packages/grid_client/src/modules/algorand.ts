import { default as AlgoSdk } from "algosdk";
import axios from "axios";
import * as PATH from "path";

import { GridClientConfig } from "../config";
import { validateInput } from "../helpers";
import { expose } from "../helpers/expose";
import { appPath, BackendStorage, StorageUpdateAction } from "../storage";
import blockchainInterface, { blockchainType } from "./blockchainInterface";
import {
    AlgorandAccountAssetsFromAddressModel,
    AlgorandAccountCreateModel,
    AlgorandAccountInitModel,
    AlgorandCreateTransactionModel,
    AlgorandSignatureModel,
    AlgorandTransferModel,
    BlockchainAssetModel,
    BlockchainAssetsModel,
    BlockchainCreateResultModel,
    BlockchainDeleteModel,
    BlockchainGetModel,
    BlockchainGetResultModel,
    BlockchainListResultModel,
    BlockchainSignModel,
} from "./models";

class Algorand implements blockchainInterface {
    baseUrl = "http://node.testnet.algoexplorerapi.io/";
    backendStorage: BackendStorage;
    fileName = "algorand.json";
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
    }
    async save(name: string, value: string) {
        const [path, data] = await this._load();
        if (data[name]) {
            throw Error(`A wallet with the same name ${name} already exists`);
        }
        await this.backendStorage.update(path, name, value);
    }
    async _load() {
        const path = PATH.join(appPath, this.fileName);
        let data = await this.backendStorage.load(path);
        if (!data) {
            data = {};
        }
        return [path, data];
    }
    @expose
    async list(): Promise<BlockchainListResultModel[]> {
        const [, data] = await this._load();
        const accounts = [];

        for (const [name] of Object.entries(data)) {
            const account = await AlgoSdk.mnemonicToSecretKey(data[name]);
            accounts.push({
                name: name,
                public_key: account.addr,
                blockchain_type: blockchainType.algorand,
            });
        }

        return accounts;
    }
    @expose
    @validateInput
    async exist(options: BlockchainGetModel) {
        return (await this.list()).map(account => account.name == options.name).includes(true);
    }
    @expose
    @validateInput
    async delete(options: BlockchainDeleteModel) {
        const [path, data] = await this._load();
        if (!data[options.name]) {
            throw Error(`Couldn't find a wallet with name ${options.name}`);
        }
        await this.backendStorage.update(path, options.name, "", StorageUpdateAction.delete);
        return "Deleted";
    }
    @expose
    @validateInput
    async create(options: AlgorandAccountCreateModel): Promise<BlockchainCreateResultModel> {
        const account_exists = await this.exist({ name: options.name });
        if (account_exists) throw Error(`Name ${options.name} already exists`);

        const account = await AlgoSdk.generateAccount();
        const account_mnemonic = AlgoSdk.secretKeyToMnemonic(account.sk);
        console.log(account);
        await this.save(options.name, account_mnemonic);
        return {
            name: options.name,
            public_key: account.addr,
            mnemonic: account_mnemonic,
            blockchain_type: blockchainType.algorand,
        };
    }
    @expose
    @validateInput
    async init(options: AlgorandAccountInitModel) {
        const account = await AlgoSdk.mnemonicToSecretKey(options.secret);
        await this.save(options.name, options.secret);
        return account.addr;
    }
    @expose
    @validateInput
    async assets(options: BlockchainGetModel): Promise<BlockchainAssetsModel> {
        const account_mnemonics = await this.get({ name: options.name });
        const account = await AlgoSdk.mnemonicToSecretKey(account_mnemonics.mnemonic);
        const assets = await this.assetsByAddress({ address: account.addr });
        return {
            name: options.name,
            public_key: account.addr,
            blockchain_type: blockchainType.algorand,
            assets: assets ?? [],
        };
    }
    @expose
    @validateInput
    async assetsByAddress(options: AlgorandAccountAssetsFromAddressModel): Promise<BlockchainAssetModel[]> {
        const assets = await axios.get(this.baseUrl + `v2/accounts/${options.address}/`).then(res => res.data.assets);
        assets.forEach(asset => {
            asset["asset"] = asset["asset-id"];
            delete asset["asset-id"];
        });

        return assets;
    }

    @expose
    @validateInput
    async get(options: BlockchainGetModel): Promise<BlockchainGetResultModel> {
        const [, data] = await this._load();
        if (!data[options.name]) {
            throw Error(`Couldn't find a wallet with name ${options.name}`);
        }
        const mnemonic = data[options.name];
        const account = await AlgoSdk.mnemonicToSecretKey(mnemonic);

        return {
            name: options.name,
            public_key: account.addr,
            mnemonic: mnemonic,
            blockchain_type: blockchainType.algorand,
        };
    }

    async sign_txn(options: AlgorandSignatureModel) {
        const accountMnemonicsFromName = await this.get({ name: options.name });
        const account = await AlgoSdk.mnemonicToSecretKey(accountMnemonicsFromName.mnemonic);
        const signed_txn = await AlgoSdk.signTransaction(options.txn, account.sk);
        return signed_txn;
    }
    @expose
    @validateInput
    async sign(options: BlockchainSignModel) {
        const accountMnemonicsFromName = await this.get({ name: options.name });
        const account = await AlgoSdk.mnemonicToSecretKey(accountMnemonicsFromName.mnemonic);
        const message = Uint8Array.from(Buffer.from(options.content, "hex"));
        await AlgoSdk.signBytes(message, account.sk);
        const messageSent = Buffer.from(message).toString("hex");

        return messageSent;
    }

    @validateInput
    async createTransaction(options: AlgorandCreateTransactionModel) {
        const params_fetched = await axios.get(this.baseUrl + `v2/transactions/params`).then(res => res.data);
        console.log("transaction params fetched");
        const request_params = {
            flatFee: true,
            fee: 1000,
            firstRound: params_fetched["last-round"],
            lastRound: params_fetched["last-round"] + 1000,
            genesisID: params_fetched["genesis-id"],
            genesisHash: params_fetched["genesis-hash"],
        };
        const note = AlgoSdk.encodeObj(options.description as unknown as Record<string | number | symbol, any>);
        const accountMnemonics = await this.get({ name: options.name });
        const account = AlgoSdk.mnemonicToSecretKey(accountMnemonics.mnemonic);
        const txn = AlgoSdk.makePaymentTxnWithSuggestedParams(
            account.addr,
            options.address_dest,
            options.amount,
            undefined,
            note,
            request_params,
        );
        console.log("transaction binary built");

        return txn;
    }

    @expose
    @validateInput
    async pay(options: AlgorandTransferModel) {
        const txn = await this.createTransaction(options);

        console.log("transaction binary built", txn);

        const signedTxn = await this.sign_txn({ txn: txn, name: options.name });

        console.log("transaction signed");

        try {
            const submitted_txn = await axios.post(this.baseUrl + `v2/transactions`, signedTxn?.blob);
            return submitted_txn.data;
        } catch (error) {
            throw error.response.data.message;
        }
    }
}
export { Algorand as algorand };
