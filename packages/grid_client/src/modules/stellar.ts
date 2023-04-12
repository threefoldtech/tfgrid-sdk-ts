import axios from "axios";
import { Buffer } from "buffer";
import * as PATH from "path";
import { default as StellarSdk } from "stellar-sdk";

import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { appPath, BackendStorage, StorageUpdateAction } from "../storage/backend";
import {
    BlockchainAssetModel,
    BlockchainAssetsModel,
    BlockchainCreateResultModel,
    BlockchainDeleteModel,
    BlockchainGetModel,
    BlockchainGetResultModel,
    BlockchainListResultModel,
    BlockchainSignModel,
    StellarWalletBalanceByAddressModel,
    StellarWalletCreateModel,
    StellarWalletInitModel,
    StellarWalletTransferModel,
    StellarWalletVerifyModel,
} from ".";
import blockchainInterface, { blockchainType } from "./blockchainInterface";

const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

class Stellar implements blockchainInterface {
    fileName = "stellar.json";
    backendStorage: BackendStorage;
    mnemonic: string;

    constructor(config: GridClientConfig) {
        this.mnemonic = config.mnemonic;
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

    async _load() {
        const path = PATH.join(appPath, this.fileName);
        let data = await this.backendStorage.load(path);
        if (!data) {
            data = {};
        }
        return [path, data];
    }

    async save(name: string, secret: string) {
        const [path, data] = await this._load();
        if (data[name]) {
            throw Error(`A wallet with the same name ${name} already exists`);
        }
        await this.backendStorage.update(path, name, secret);
    }

    async getWalletSecret(name: string) {
        const [, data] = await this._load();
        if (!data[name]) {
            throw Error(`Couldn't find a wallet with name ${name}`);
        }
        return data[name];
    }

    @expose
    @validateInput
    async create(options: StellarWalletCreateModel): Promise<BlockchainCreateResultModel> {
        const account_exists = await this.exist({ name: options.name });
        if (account_exists) throw Error(`Name ${options.name} already exists`);

        const account = StellarSdk.Keypair.random();
        const publicKey = account.publicKey();
        try {
            await axios.get(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
        } catch (e) {
            throw Error(`An error happened while creating your account. ${e}`);
        }

        await this.save(options.name, account.secret());
        return {
            name: options.name,
            public_key: publicKey,
            secret: account.secret(),
            blockchain_type: blockchainType.stellar,
        };
    }

    @expose
    @validateInput
    async sign(options: BlockchainSignModel) {
        const secret = await this.getWalletSecret(options.name);
        const walletKeypair = StellarSdk.Keypair.fromSecret(secret);
        const signed_content = walletKeypair.sign(options.content);
        return Buffer.from(signed_content).toString("hex");
    }

    @expose
    @validateInput
    async verify(options: StellarWalletVerifyModel) {
        const walletKeypair = StellarSdk.Keypair.fromPublicKey(options.public_key);
        return walletKeypair.verify(options.content, Buffer.from(options.signedContent, "hex"));
    }

    @expose
    @validateInput
    async init(options: StellarWalletInitModel) {
        const walletKeypair = StellarSdk.Keypair.fromSecret(options.secret);
        const walletPublicKey = walletKeypair.publicKey();
        await server.loadAccount(walletPublicKey);
        await this.save(options.name, options.secret);
        return walletPublicKey;
    }

    @expose
    @validateInput
    async get(options: BlockchainGetModel): Promise<BlockchainGetResultModel> {
        const secret = await this.getWalletSecret(options.name);
        const walletKeypair = StellarSdk.Keypair.fromSecret(secret);
        return {
            name: options.name,
            public_key: walletKeypair.publicKey(),
            secret: secret,
            blockchain_type: blockchainType.stellar,
        };
        // TODO: return wallet secret after adding security context on the server calls
    }

    @expose
    @validateInput
    async update(options: StellarWalletInitModel) {
        if (!(await this.exist(options))) {
            throw Error(`Couldn't find a wallet with name ${options.name} to update`);
        }
        const secret = await this.getWalletSecret(options.name);
        const deleteWallet = new BlockchainDeleteModel();
        deleteWallet.name = options.name;
        await this.delete(deleteWallet);
        try {
            return await this.init(options);
        } catch (e) {
            const oldSecret = options.secret;
            options.secret = secret;
            await this.init(options);
            throw Error(`Couldn't import wallet with the secret ${oldSecret} due to: ${e}`);
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

        for (const [name, secret] of Object.entries(data)) {
            accounts.push({
                name: name,
                public_key: StellarSdk.Keypair.fromSecret(secret).publicKey(),
                blockchain_type: blockchainType.stellar,
            });
        }

        return accounts;
    }

    @expose
    @validateInput
    async assets(options: BlockchainGetModel): Promise<BlockchainAssetsModel> {
        const secret = await this.getWalletSecret(options.name);
        if (!secret) {
            throw Error(`Couldn't find a wallet with name ${options.name}`);
        }
        const walletKeypair = StellarSdk.Keypair.fromSecret(secret);
        const walletPublicKey = walletKeypair.publicKey();
        const walletAddress = new StellarWalletBalanceByAddressModel();
        walletAddress.address = walletPublicKey;

        const balances = await this.balance_by_address(walletAddress);

        return {
            name: options.name,
            public_key: walletPublicKey,
            blockchain_type: blockchainType.stellar,
            assets: balances ? balances : [],
        };
    }

    @expose
    @validateInput
    async balance_by_address(options: StellarWalletBalanceByAddressModel): Promise<BlockchainAssetModel[]> {
        const account = await server.loadAccount(options.address);
        const balances = [];
        for (const balance of account.balances) {
            if (!balance.asset_code) {
                balance.asset_code = "XLM";
            }
            balances.push({ asset: balance.asset_code, amount: balance.balance });
        }
        return balances;
    }

    @expose
    @validateInput
    async pay(options: StellarWalletTransferModel) {
        const secret = await this.getWalletSecret(options.name);
        if (!secret) {
            throw Error(`Couldn't find a wallet with name ${options.name}`);
        }
        const sourceKeypair = StellarSdk.Keypair.fromSecret(secret);
        const sourcePublicKey = sourceKeypair.publicKey();
        const sourceAccount = await server.loadAccount(sourcePublicKey);

        let asset;
        if (options.asset != "XLM") {
            let issuer;
            for (const balance of sourceAccount.balances) {
                if (balance.asset_code === options.asset) {
                    issuer = balance.asset_issuer;
                }
            }
            if (!issuer) {
                throw Error(`couldn't find this asset ${options.asset} on source wallet`);
            }
            asset = new StellarSdk.Asset(options.asset, issuer);
        } else {
            asset = StellarSdk.Asset.native();
        }
        const fee = await server.fetchBaseFee();
        const memo = StellarSdk.Memo.text(options.description);
        const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
            fee: fee,
            networkPassphrase: StellarSdk.Networks.TESTNET,
            memo: memo,
        })
            .addOperation(
                StellarSdk.Operation.payment({
                    destination: options.address_dest,
                    asset: asset,
                    amount: options.amount.toString(),
                }),
            )
            .setTimeout(30)
            .build();

        transaction.sign(sourceKeypair);
        console.log(transaction.toEnvelope().toXDR("base64"));
        try {
            const transactionResult = await server.submitTransaction(transaction);
            console.log(JSON.stringify(transactionResult, null, 2));
            console.log("Success! View the transaction at: ", transactionResult._links.transaction.href);
            return transactionResult._links.transaction.href;
        } catch (e) {
            console.log("An error has occured:", e);
            throw Error(e);
        }
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
}

export { Stellar as stellar };
