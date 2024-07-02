import { GridClientError, RequestError, ValidationError } from "@threefold/types";
import axios, { AxiosError } from "axios";
import { Buffer } from "buffer";
import * as PATH from "path";
import { default as StellarSdk } from "stellar-sdk";

import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { appPath, BackendStorage, BackendStorageType, StorageUpdateAction } from "../storage/backend";
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
  tfClient: TFClient;

  /**
   * Class representing a Stellar blockchain implementation that implements the blockchainInterface.
   *
   * This class provides methods for creating, initializing, signing, verifying, updating, checking existence,
   * listing, retrieving assets, checking balance by address, and making payments for Stellar wallets.
   *
   * @class Stellar
   * @param {GridClientConfig} config - The configuration object for initializing the client.
   */
  constructor(public config: GridClientConfig) {
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
    this.tfClient = config.tfclient;
  }

  /**
   * Saves the extrinsics to the `key-value` store backend if the backend storage type is `tfkvstore` and extrinsics are provided.
   *
   * @param {any[]} extrinsics - The extrinsics to be saved to the `key-value` store backend.
   * @returns {Promise<void>} - A promise that resolves once the extrinsics are saved to the backend.
   */
  private async saveIfKVStoreBackend(extrinsics: any[]): Promise<void> {
    if (this.config.backendStorageType === BackendStorageType.tfkvstore && extrinsics && extrinsics.length > 0) {
      extrinsics = extrinsics.filter(e => e !== undefined);
      if (extrinsics.length > 0) {
        await this.tfClient.connect();
        await this.tfClient.applyAllExtrinsics(extrinsics);
      }
    }
  }

  /**
   * Loads data from the backend storage using the specified path.
   *
   * @returns {Promise<[string, any]>} A promise that resolves with an array containing the path and the loaded data.
   */
  async _load(): Promise<[string, any]> {
    const path = PATH.join(appPath, this.fileName);
    let data = await this.backendStorage.load(path);
    if (!data) {
      data = {};
    }
    return [path, data];
  }

  /**
   * Saves a wallet with the provided name and secret to the backend storage.
   *
   * @param {string} name - The name of the wallet to be saved.
   * @param {string} secret - The secret key of the wallet to be saved.
   * @throws {`ValidationError`} - If there is another wallet with the same name.
   * @returns {Promise<void>} - A promise that resolves once the wallet is saved to the backend storage.
   */
  async save(name: string, secret: string): Promise<void> {
    const [path, data] = await this._load();
    if (data[name]) {
      throw new ValidationError(`A wallet with the same name ${name} already exists.`);
    }
    const updateOperations = await this.backendStorage.update(path as string, name, secret);
    await this.saveIfKVStoreBackend(updateOperations);
  }

  /**
   * Retrieves the secret key of a wallet by its name from the backend storage.
   *
   * @param {string} name - The name of the wallet to retrieve the secret key for.
   * @throws {`ValidationError`} - If the wallet with the provided name is not found in the backend storage.
   * @returns {Promise<string>} - A promise that resolves with the secret key of the wallet.
   */
  async getWalletSecret(name: string): Promise<string> {
    const [, data] = await this._load();
    if (!data[name]) {
      throw new ValidationError(`Couldn't find a wallet with name ${name}.`);
    }
    return data[name];
  }

  /**
   * Creates a new Stellar wallet with the provided name and saves it to the backend storage.
   *
   * @param {StellarWalletCreateModel} options - The options for creating the Stellar wallet, including the name.
   * @returns {Promise<BlockchainCreateResultModel>} - A promise that resolves with the details of the created wallet, including name, public key, secret, and blockchain type.
   * @throws {`ValidationError`} - If a wallet with the same name already exists.
   * @throws {`RequestError`} - If an error occurs while creating the account.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async create(options: StellarWalletCreateModel): Promise<BlockchainCreateResultModel> {
    const account_exists = await this.exist({ name: options.name });
    if (account_exists) throw new ValidationError(`Name ${options.name} already exists`);

    const account = StellarSdk.Keypair.random();
    const publicKey = account.publicKey();
    try {
      await axios.get(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
    } catch (e) {
      throw new RequestError(`An error happened while creating your account. ${e}`, (e as AxiosError).response?.status);
    }

    await this.save(options.name, account.secret());
    return {
      name: options.name,
      public_key: publicKey,
      secret: account.secret(),
      blockchain_type: blockchainType.stellar,
    };
  }

  /**
   * Signs the provided content using the secret key of the wallet associated with the given name.
   *
   * @param {BlockchainSignModel} options - The options containing the name of the wallet and the content to sign.
   * @returns {Promise<string>} A Promise that resolves the signed content in `hexadecimal` format.
   * @throws {`ValidationError`} - If the wallet with the provided name is not found in the backend storage.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async sign(options: BlockchainSignModel): Promise<string> {
    const secret = await this.getWalletSecret(options.name);
    const walletKeypair = StellarSdk.Keypair.fromSecret(secret);
    const signed_content = walletKeypair.sign(options.content);
    return Buffer.from(signed_content).toString("hex");
  }

  /**
   * Verifies the provided content using the public key and signed content.
   *
   * @param {StellarWalletVerifyModel} options - The options containing the public key, content, and signed content.
   * @returns {boolean} - A boolean indicating whether the content is successfully verified.
   * @throws {`ValidationError`} - If the provided public key is invalid or the verification fails.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  verify(options: StellarWalletVerifyModel): boolean {
    const walletKeypair = StellarSdk.Keypair.fromPublicKey(options.public_key);
    return walletKeypair.verify(options.content, Buffer.from(options.signedContent, "hex"));
  }

  /**
   * Initializes a new `Stellar wallet` with the provided `name` and `secret key`.
   *
   * This method generates a new `Stellar wallet` using the provided `secret key`, loads the account associated with the wallet's `public key`, and saves the wallet to the backend storage.
   *
   * @param {StellarWalletInitModel} options - The options for initializing the `Stellar` wallet, including the name and `secret key`.
   * @returns {Promise<string>} A Promise that resolves the `public key` of the initialized `Stellar` wallet.
   * @throws {`ValidationError`} - If the provided `secret key` is invalid or the account cannot be loaded.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async init(options: StellarWalletInitModel): Promise<string> {
    const walletKeypair = StellarSdk.Keypair.fromSecret(options.secret);
    const walletPublicKey = walletKeypair.publicKey();
    await server.loadAccount(walletPublicKey);
    await this.save(options.name, options.secret);
    return walletPublicKey;
  }

  /**
   * Retrieves the details of a `Stellar wallet` by its name from the backend storage.
   *
   * This method fetches the public key and `secret key` associated with the provided wallet `name`.
   *
   * @param {BlockchainGetModel} options - The options containing the name of the wallet to retrieve.
   * @returns {Promise<BlockchainGetResultModel>} - A promise that resolves with the details of the wallet, including `name`, `public key`, `secret key`, and `blockchain type`.
   * @throws {`ValidationError`} - If the wallet with the provided name is not found in the backend storage.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
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

  /**
   * Updates an existing `Stellar wallet` with the provided `name` and `secret key`.
   *
   * This method first checks if a wallet with the provided `name` exists, then deletes the wallet and reinitializes it with the new `secret key`.
   *
   * @param {StellarWalletInitModel} options - The options for updating the `Stellar wallet`, including the `name` and new `secret key`.
   * @returns {Promise<string>} - A promise that resolves with the public key of the updated `Stellar wallet`.
   * @throws {`ValidationError`} - If the wallet with the provided `name` is not found or if there is an issue during the update process.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async update(options: StellarWalletInitModel): Promise<string> {
    if (!(await this.exist(options))) {
      throw new ValidationError(`Couldn't find a wallet with name ${options.name} to update.`);
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
      throw new GridClientError(`Couldn't import wallet with the secret ${oldSecret} due to: ${e}`);
    }
  }

  /**
   * Checks if a wallet with the provided `name` exists in the backend storage.
   *
   * @param {BlockchainGetModel} options - The options containing the `name` of the wallet to check.
   * @returns {Promise<boolean>} - A promise that resolves with a boolean indicating whether the wallet exists.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async exist(options: BlockchainGetModel): Promise<boolean> {
    return (await this.list()).map(account => account.name == options.name).includes(true);
  }

  /**
   * Retrieves a list of `Stellar wallets` from the backend storage.
   *
   * This method fetches the `names`, `public keys`, and `blockchain types` of all `Stellar wallets` stored in the backend.
   *
   * @returns {Promise<BlockchainListResultModel[]>} - A promise that resolves with an array of objects representing each `Stellar wallet`, including `name`, `public key`, and `blockchain type`.
   * @throws {ValidationError} - If there is an issue while retrieving the list of wallets from the backend storage.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async list(): Promise<BlockchainListResultModel[]> {
    const [, data] = await this._load();
    const accounts: BlockchainListResultModel[] = [];

    for (const [name, secret] of Object.entries(data)) {
      accounts.push({
        name: name,
        public_key: StellarSdk.Keypair.fromSecret(secret).publicKey(),
        blockchain_type: blockchainType.stellar,
      });
    }

    return accounts;
  }

  /**
   * Retrieves the assets associated with a `Stellar wallet` by its `name` from the backend storage.
   *
   * This method fetches the `public key` of the wallet, retrieves the balances by address, and returns the assets including the asset code and balance.
   *
   * @param {BlockchainGetModel} options - The options containing the `name` of the wallet to retrieve assets for.
   * @returns {Promise<BlockchainAssetsModel>} - A promise that resolves with the assets of the wallet, including `name`, `public key`, `blockchain type`, and `assets array`.
   * @throws {`ValidationError`} - If the wallet with the provided `name` is not found in the backend storage.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async assets(options: BlockchainGetModel): Promise<BlockchainAssetsModel> {
    const secret = await this.getWalletSecret(options.name);
    if (!secret) {
      throw new ValidationError(`Couldn't find a wallet with name ${options.name}.`);
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

  /**
   * Retrieves the assets associated with a `Stellar wallet` by its `address` from the backend storage.
   *
   * This method fetches the `balances` of the account associated with the provided `address` and returns the assets including the `asset code` and `balance`.
   *
   * @param {StellarWalletBalanceByAddressModel} options - The options containing the `address` of the wallet to retrieve assets for.
   * @returns {Promise<BlockchainAssetModel[]>} - A promise that resolves with the assets of the wallet, including `asset` and `amount`.
   * @throws {`ValidationError`} - If the wallet with the provided `address` is not found in the backend storage.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async balance_by_address(options: StellarWalletBalanceByAddressModel): Promise<BlockchainAssetModel[]> {
    const account = await server.loadAccount(options.address);
    const balances: BlockchainAssetModel[] = [];
    for (const balance of account.balances) {
      if (!balance.asset_code) {
        balance.asset_code = "XLM";
      }
      balances.push({ asset: balance.asset_code, amount: balance.balance });
    }
    return balances;
  }

  /**
   * Pays the specified `amount` of a given `asset` to a destination `address` from a `Stellar wallet`.
   *
   * This method retrieves the `secret key` of the wallet associated with the provided `name`, loads the source account,
   * constructs a transaction to make a payment to the destination address with the specified asset and amount,
   * signs the transaction with the wallet's secret key, and submits the transaction to the Stellar network.
   *
   * @param {StellarWalletTransferModel} options - The options for making the payment, including the name of the wallet, destination address, amount, asset, and optional description.
   * @returns {Promise<string>} - A promise that resolves with the URL to view the transaction details on the Stellar network.
   * @throws {`ValidationError`} - If the wallet with the provided name is not found or if there is an issue during the payment process.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async pay(options: StellarWalletTransferModel): Promise<string> {
    const secret = await this.getWalletSecret(options.name);
    if (!secret) {
      throw new ValidationError(`Couldn't find a wallet with name ${options.name}`);
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
        throw new ValidationError(`couldn't find this asset ${options.asset} on source wallet.`);
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
      throw new GridClientError(`An error has occurred: ${e}`);
    }
  }

  /**
   * Deletes a wallet with the provided `name` from the backend storage.
   *
   * This method checks if a wallet with the given `name` exists, deletes it from the backend storage,
   * and saves the changes to the backend if the storage type is `tfkvstore`.
   *
   * @param {BlockchainDeleteModel} options - The options containing the name of the wallet to delete.
   * @returns {Promise<string>} - A promise that resolves with a message indicating the deletion was successful.
   * @throws {`ValidationError`} - If the wallet with the provided name is not found in the backend storage.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async delete(options: BlockchainDeleteModel): Promise<string> {
    const [path, data] = await this._load();
    if (!data[options.name]) {
      throw new ValidationError(`Couldn't find a wallet with name ${options.name}.`);
    }
    const updateOperations = await this.backendStorage.update(
      path as string,
      options.name,
      "",
      StorageUpdateAction.delete,
    );
    await this.saveIfKVStoreBackend(updateOperations);
    return "Deleted";
  }
}

export { Stellar as stellar };
