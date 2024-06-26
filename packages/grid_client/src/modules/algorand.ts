import { ExtrinsicResult } from "@threefold/tfchain_client";
import { RequestError, ValidationError } from "@threefold/types";
import { default as AlgoSdk } from "algosdk";
import axios from "axios";
import * as PATH from "path";
import urlJoin from "url-join";

import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { validateInput } from "../helpers";
import { expose } from "../helpers/expose";
import { appPath, BackendStorage, BackendStorageType, StorageUpdateAction } from "../storage";
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
  tfClient: TFClient;

  /**
   * Class representing an implementation of the Algorand blockchain interface.
   * This class provides methods for interacting with the Algorand blockchain, such as creating accounts,
   * signing transactions, retrieving assets, and more.
   *
   * @param {GridClientConfig} config - The configuration object for initializing the client.
   *
   */
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
    this.tfClient = config.tfclient;
  }

  /**
   * Saves the provided extrinsics to the key-value store backend if the backend storage type is tfkvstore.
   *
   * @param {ExtrinsicResult<any>[]} extrinsics - The extrinsics to be saved to the backend storage.
   * @returns {Promise<void>} - A promise that resolves once the extrinsics are saved to the backend storage.
   *
   */
  private async saveIfKVStoreBackend(extrinsics: ExtrinsicResult<any>[]): Promise<void> {
    if (this.config.backendStorageType === BackendStorageType.tfkvstore && extrinsics && extrinsics.length > 0) {
      extrinsics = extrinsics.filter(e => e !== undefined);
      if (extrinsics.length > 0) {
        await this.tfClient.connect();
        await this.tfClient.applyAllExtrinsics(extrinsics);
      }
    }
  }

  /**
   * Saves the provided data to the backend storage under the specified name.
   * If a wallet with the same name already exists, a `ValidationError` is thrown.
   *
   * @param {string} name - The name under which the data will be saved.
   * @param {string} value - The data to be saved to the backend storage.
   * @returns {Promise<void>} - A promise that resolves once the data is saved to the backend storage.
   *
   */
  async save(name: string, value: string): Promise<void> {
    const [path, data] = await this._load();
    if (data[name]) {
      throw new ValidationError(`A wallet with the same name ${name} already exists.`);
    }
    const updateOperations = await this.backendStorage.update(path, name, value);
    return await this.saveIfKVStoreBackend(updateOperations);
  }

  /**
   * Loads data from the backend storage using the specified path.
   * If no data is found, an empty object is returned.
   *
   * @returns {[string, Record<string, string>]} - A tuple containing the path and the loaded data.
   *
   */
  async _load(): Promise<[string, Record<string, string>]> {
    const path = PATH.join(appPath, this.fileName);
    let data = await this.backendStorage.load(path);
    if (!data) {
      data = {};
    }
    return [path, data];
  }

  /**
   * Retrieves a list of accounts from the Algorand blockchain.
   *
   * @returns {Promise<BlockchainListResultModel[]>} - A promise that resolves with an array of BlockchainListResultModel objects,
   * each representing an account with properties including name, public key, and blockchain type.
   *
   * @decorators
   * - `@expose`: Exposes the method for external use.
   *
   */
  @expose
  async list(): Promise<BlockchainListResultModel[]> {
    const [, data] = await this._load();
    const accounts: BlockchainListResultModel[] = [];

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

  /**
   * Checks if an account with the specified name exists in the Algorand blockchain.
   *
   * @param {BlockchainGetModel} options - The options containing the name of the account to check.
   * @returns {Promise<boolean>} - A promise that resolves with a boolean indicating whether an account with the specified name exists.
   *
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   *
   */
  @expose
  @validateInput
  async exist(options: BlockchainGetModel): Promise<boolean> {
    return (await this.list()).map(account => account.name == options.name).includes(true);
  }

  /**
   * Deletes a wallet with the specified name from the backend storage.
   * If the wallet does not exist, a `ValidationError` is thrown.
   *
   * @param {BlockchainDeleteModel} options - The options containing the name of the wallet to delete.
   * @returns {Promise<string>} - A promise that resolves with a message indicating the wallet was deleted.
   *
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   *
   */
  @expose
  @validateInput
  async delete(options: BlockchainDeleteModel): Promise<string> {
    const [path, data] = await this._load();
    if (!data[options.name]) {
      throw new ValidationError(`Couldn't find a wallet with name ${options.name}.`);
    }
    const updateOperations = await this.backendStorage.update(path, options.name, "", StorageUpdateAction.delete);
    await this.saveIfKVStoreBackend(updateOperations);
    return "Deleted";
  }

  /**
   * Creates a new account on the Algorand blockchain.
   *
   * Checks if an account with the specified name already exists, and throws a `ValidationError` if it does.
   * Generates a new account using `AlgoSdk`, saves the account mnemonic to the backend storage under the specified name,
   * and returns an object containing the account name, public key, mnemonic, and blockchain type.
   *
   * @param {AlgorandAccountCreateModel} options - The options for creating the account, including the name of the account.
   * @returns {Promise<BlockchainCreateResultModel>} - A promise that resolves with the created account details.
   *
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   *
   */
  @expose
  @validateInput
  async create(options: AlgorandAccountCreateModel): Promise<BlockchainCreateResultModel> {
    const account_exists = await this.exist({ name: options.name });
    if (account_exists) throw new ValidationError(`Name ${options.name} already exists.`);

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

  /**
   * Initializes a new account on the Algorand blockchain.
   *
   * This method generates a new account using the provided secret key, saves the account under the specified name,
   * and returns the address of the created account.
   *
   * @param {AlgorandAccountInitModel} options - The options for initializing the account, including the name and secret key.
   * @returns {Promise<string>} - A promise that resolves with the address of the created account.
   *
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   *
   */
  @expose
  @validateInput
  async init(options: AlgorandAccountInitModel): Promise<string> {
    const account = await AlgoSdk.mnemonicToSecretKey(options.secret);
    await this.save(options.name, options.secret);
    return account.addr;
  }

  /**
   * Retrieves the assets associated with the account specified in the options.
   *
   * This method fetches the account details using the provided name from the backend storage,
   * converts the `mnemonic` to a `secret key`, and then retrieves the assets associated with the account address.
   *
   * @param {BlockchainGetModel} options - The options containing the name of the account to retrieve assets for.
   * @returns {Promise<BlockchainAssetsModel>} - A promise that resolves with the assets associated with the specified account,
   * including the account name, public key, blockchain type, and an array of assets.
   *
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   *
   */
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

  /**
   * Retrieves the assets associated with the account address specified in the options.
   *
   * This method fetches the assets associated with the provided address from the Algorand blockchain,
   * processes the response data to map asset IDs to 'asset' property, and returns an array of `BlockchainAssetModel` objects.
   *
   * @param {AlgorandAccountAssetsFromAddressModel} options - The options containing the address of the account to retrieve assets for.
   * @returns {Promise<BlockchainAssetModel[]>} - A promise that resolves with an array of `BlockchainAssetModel` objects,
   * each representing an asset with properties including the asset ID and amount.
   *
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   *
   */
  @expose
  @validateInput
  async assetsByAddress(options: AlgorandAccountAssetsFromAddressModel): Promise<BlockchainAssetModel[]> {
    const assets = await axios
      .get(urlJoin(this.baseUrl, `v2/accounts/${options.address}/`))
      .then(res => res.data.assets);
    assets.forEach(asset => {
      asset["asset"] = asset["asset-id"];
      delete asset["asset-id"];
    });

    return assets;
  }

  /**
   * Retrieves the details of a wallet/account with the specified name from the backend storage.
   *
   * This method loads the data from the backend storage, checks if a wallet with the provided name exists,
   * retrieves the mnemonic associated with the account, converts it to a secret key, and returns an object
   * containing the account name, public key, mnemonic, and blockchain type.
   *
   * @param {BlockchainGetModel} options - The options containing the name of the account to retrieve.
   * @returns {Promise<BlockchainGetResultModel>} - A promise that resolves with the details of the retrieved account.
   *
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   *
   */
  @expose
  @validateInput
  async get(options: BlockchainGetModel): Promise<BlockchainGetResultModel> {
    const [, data] = await this._load();
    if (!data[options.name]) {
      throw new ValidationError(`Couldn't find a wallet with name ${options.name}.`);
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

  /**
   * Signs a transaction using the provided account name and transaction object.
   * Retrieves the account mnemonic using the provided name, converts it to a secret key,
   * and signs the transaction using the secret key.
   *
   * @param {AlgorandSignatureModel} options - The options containing the transaction object and the name of the account.
   * @returns {Promise<{ txID: string; blob: Uint8Array }>} - A promise that resolves with the signed transaction object.
   *
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   *
   */
  async sign_txn(options: AlgorandSignatureModel): Promise<{ txID: string; blob: Uint8Array }> {
    const accountMnemonicsFromName = await this.get({ name: options.name });
    const account = await AlgoSdk.mnemonicToSecretKey(accountMnemonicsFromName.mnemonic);
    const signed_txn = await AlgoSdk.signTransaction(options.txn, account.sk);
    return signed_txn;
  }

  /**
   * Signs a message content using the account associated with the specified name.
   * Retrieves the account `mnemonic` using the provided `name`, converts it to a `secret key`,
   * signs the message content using the `secret key`, and returns the signed message as a `hexadecimal string`.
   *
   * @param {BlockchainSignModel} options - The options containing the name of the account and the message content to sign.
   * @returns {Promise<string>} - A promise that resolves with the signed message content as a `hexadecimal string`.
   *
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   *
   */
  @expose
  @validateInput
  async sign(options: BlockchainSignModel): Promise<string> {
    const accountMnemonicsFromName = await this.get({ name: options.name });
    const account = await AlgoSdk.mnemonicToSecretKey(accountMnemonicsFromName.mnemonic);
    const message = Uint8Array.from(Buffer.from(options.content, "hex"));
    await AlgoSdk.signBytes(message, account.sk);
    const messageSent = Buffer.from(message).toString("hex");

    return messageSent;
  }

  /**
   * Creates a transaction for sending funds on the Algorand blockchain.
   * Fetches transaction parameters from the Algorand node API, including flat fee, first and last round, genesis ID, and genesis hash.
   * Encodes the transaction note using the provided description.
   * Retrieves the account secret key using the account name from options.
   * Constructs a payment transaction with the sender's address, recipient's address, amount, note, and request parameters.
   *
   * @param {AlgorandCreateTransactionModel} options - The options for creating the transaction, including the sender's account name, recipient's address, amount, and optional description.
   * @returns {AlgoSdk.Transaction} - The constructed transaction object ready for signing and submission.
   *
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   *
   */
  @validateInput
  async createTransaction(options: AlgorandCreateTransactionModel): Promise<AlgoSdk.Transaction> {
    const params_fetched = await axios.get(urlJoin(this.baseUrl, `v2/transactions/params`)).then(res => res.data);
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

  /**
   * Initiates a payment transaction on the Algorand blockchain.
   * Creates a transaction object using the provided options, including sender's account name, recipient's address, and amount.
   * Signs the transaction using the sender's account and submits it to the Algorand node API.
   *
   * @param {AlgorandTransferModel} options - The options for initiating the payment transaction.
   * @returns {Promise<any>} - A promise that resolves with the result of the submitted transaction.
   *
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   *
   */
  @expose
  @validateInput
  async pay(options: AlgorandTransferModel): Promise<any> {
    const txn = await this.createTransaction(options);

    console.log("transaction binary built", txn);

    const signedTxn = await this.sign_txn({ txn: txn, name: options.name });

    console.log("transaction signed");

    try {
      const submitted_txn = await axios.post(urlJoin(this.baseUrl, `v2/transactions`), signedTxn?.blob);
      return submitted_txn.data;
    } catch (error) {
      throw new RequestError(error.response.data.message, error.response.status);
    }
  }
}
export { Algorand as algorand };
