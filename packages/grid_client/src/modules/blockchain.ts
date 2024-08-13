import { GridClientError, ValidationError } from "@threefold/types";

import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { algorand } from "./algorand";
import blockchainInterface, { blockchainType } from "./blockchainInterface";
import {
  BlockchainAssetsModel,
  BlockchainCreateModel,
  BlockchainCreateResultModel,
  BlockchainDeleteModel,
  BlockchainGetModel,
  BlockchainGetResultModel,
  BlockchainInitModel,
  BlockchainListModel,
  BlockchainListResultModel,
  BlockchainPayModel,
  BlockchainPayNoNameModel,
  BlockchainSignModel,
  BlockchainSignNoNameModel,
} from "./models";
import { stellar } from "./stellar";
import { tfchain } from "./tfchain";

class Blockchain implements blockchainInterface {
  stellar: stellar;
  algorand: algorand;
  tfchain: tfchain;
  current_account: string;
  blockchain_type: blockchainType;

  /**
   * Class representing a Blockchain interface that manages accounts across different blockchain types such as Algorand, Stellar, and TFChain.
   *
   * @param {GridClientConfig} config - The configuration object for initializing the Blockchain interface.
   *
   */
  constructor(public config: GridClientConfig) {
    this.stellar = new stellar(config);
    this.algorand = new algorand(config);
    this.tfchain = new tfchain(config);
  }

  /**
   * Check if the account exists in any of the supported blockchains (Stellar, Algorand, TFChain) and return the blockchain type.
   *
   * @param {BlockchainGetModel} options - The options containing the account name to check.
   * @returns {Promise<blockchainType | undefined>} The type of blockchain where the account exists or undefined.
   */
  async exist_in(options: BlockchainGetModel): Promise<blockchainType | undefined> {
    if (await this.stellar.exist(options)) return blockchainType.stellar;
    else if (await this.algorand.exist(options)) return blockchainType.algorand;
    else if (await this.tfchain.exist(options)) return blockchainType.tfchain;
  }

  /**
   * Check if the account exists in any of the supported blockchains (Stellar, Algorand, TFChain) and return true if it exists, false otherwise.
   *
   * @param {BlockchainGetModel} options - The options containing the account name to check.
   * @returns {Promise<boolean>} A boolean indicating whether the account exists in any of the supported blockchains.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   */
  @expose
  @validateInput
  async exist(options: BlockchainGetModel): Promise<boolean> {
    return (
      (await this.stellar.exist({ name: options.name })) ||
      (await this.algorand.exist({ name: options.name })) ||
      (await this.tfchain.exist({ name: options.name }))
    );
  }

  /**
   * Selects an account based on the provided options.
   *
   * Checks if the account exists and sets it as the current account.
   *
   * @param {BlockchainGetModel} options - The options containing the account name to select.
   * @returns {Promise<void>}
   * @throws {`ValidationError`} If the account doesn't exist.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   */
  @expose
  @validateInput
  async select(options: BlockchainGetModel): Promise<string> {
    const account_exists = await this.exist(options);

    if (!account_exists) throw new ValidationError(`Account ${options.name} doesn't exist.`);

    this.current_account = options.name;
    if (await this.exist_in(options)) {
      this.blockchain_type = (await this.exist_in(options)) as blockchainType;
    }
    return this.current_account;
  }

  /**
   * Create a new account on the specified blockchain type.
   *
   * This method checks if the account already exists and throws a ValidationError if it does.
   *
   * @param {BlockchainCreateModel} options - The options for creating the new account, including the name and blockchain type.
   * @returns {Promise<BlockchainCreateResultModel>} The result of creating the new account, including the mnemonic, secret, and twinId.
   * @throws {`ValidationError`} If the account already exists.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   */
  @expose
  @validateInput
  async create(options: BlockchainCreateModel): Promise<BlockchainCreateResultModel> {
    const account_exists = await this.exist(options);

    if (account_exists) throw new ValidationError(`Name ${options.name} already exists.`);

    return this[options.blockchain_type].create(options);
  }

  /**
   * Sign content using the selected account on the specified blockchain type.
   *
   * This method checks if an account is selected, then modifies the options to include the account name and delegates the signing to the blockchain type.
   *
   * @param {BlockchainSignNoNameModel} options - The options for signing the content, including the content to sign.
   * @returns {Promise<string>} The result of signing the content.
   * @throws {`ValidationError`} If no account is selected.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   */
  @expose
  @validateInput
  async sign(options: BlockchainSignNoNameModel): Promise<string> {
    if (!this.current_account) throw new ValidationError(`No account is selected. Please select an account first.`);

    const modified_options: BlockchainSignModel = { name: this.current_account, content: options.content };

    return this[this.blockchain_type].sign(modified_options);
  }

  /**
   * Loads the account based on the specified blockchain type.
   *
   * This method delegates the initialization to the specific blockchain type based on the provided options.
   *
   * @param {BlockchainInitModel} options - The options for initializing the new account, including the name, blockchain type, and secret.
   * @returns {Promise<string>} A promise that resolves a string that points to the account address.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   */
  @expose
  @validateInput
  async init(options: BlockchainInitModel): Promise<string> {
    return this[options.blockchain_type].init(options);
  }

  /**
   * Retrieve information about the selected account on the specified blockchain type.
   *
   * This method checks if an account is selected, then retrieves information about the account from the specific blockchain type.
   *
   * @returns {Promise<BlockchainGetResultModel>} A promise that resolves with the information about the selected account.
   * @throws {`ValidationError`} If no account is selected.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   */
  @expose
  @validateInput
  async get(): Promise<BlockchainGetResultModel> {
    if (!this.current_account) throw new ValidationError(`No account is selected. Please select an account first.`);

    const options = { name: this.current_account };

    return this[this.blockchain_type].get(options);
  }

  /**
   * Retrieve a list of accounts from the supported blockchains (Stellar, Algorand, TFChain).
   *
   * If a specific blockchain type is provided in the options, only the accounts from that blockchain will be returned.
   *
   * @param {BlockchainListModel} [options] - The options to filter the list of accounts by blockchain type.
   * @returns {Promise<BlockchainListResultModel[]>} A promise that resolves with an array of account information.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   */
  @expose
  @validateInput
  async list(options?: BlockchainListModel): Promise<BlockchainListResultModel[]> {
    if (!options || !options.blockchain_type) {
      const stellar_accounts = await this.stellar.list();
      const algorand_accounts = await this.algorand.list();
      const tfchain_accounts = await this.tfchain.list();
      return stellar_accounts.concat(algorand_accounts).concat(tfchain_accounts);
    }

    return this[options.blockchain_type].list();
  }

  /**
   * Retrieve the assets associated with the selected account on the specified blockchain type.
   *
   * This method checks if an account is selected, then retrieves the assets information from the specific blockchain type.
   *
   * @returns {Promise<BlockchainAssetsModel>} A promise that resolves with the assets information of the selected account.
   * @throws {`ValidationError`} If no account is selected.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   */
  @expose
  @validateInput
  async assets(): Promise<BlockchainAssetsModel> {
    if (!this.current_account) throw new ValidationError(`No account is selected. Please select an account first.`);

    const options = { name: this.current_account };

    return this[this.blockchain_type].assets(options);
  }

  /**
   * Pay method for transferring assets between accounts on the same blockchain type.
   *
   * This method checks if an account is selected, then modifies the options to include the account name and delegates the payment to the specific blockchain type.
   *
   * @param {BlockchainPayNoNameModel} options - The options for making the payment, including the destination blockchain type, description, destination address, amount, and asset.
   * @returns {Promise<any>} A promise that resolves with the result of the payment transaction.
   * @throws {`ValidationError`} If no account is selected.
   * @throws {`GridClientError`} If transferring between different blockchain types is attempted.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   */
  @expose
  @validateInput
  // TODO : bridge, still
  async pay(options: BlockchainPayNoNameModel): Promise<any> {
    if (!this.current_account) throw new ValidationError(`No account is selected. Please select an account first.`);

    if (this.blockchain_type != options.blockchain_type_dest)
      throw new GridClientError(`Transfer between blockchains isn't implemented yet.`);

    const modified_options: BlockchainPayModel = {
      name: this.current_account,
      blockchain_type_dest: options.blockchain_type_dest,
      description: options.description,
      address_dest: options.address_dest,
      amount: options.amount,
      asset: options.asset,
    };

    return this[this.blockchain_type].pay(modified_options);
  }

  /**
   * Delete the selected account on the specified blockchain type.
   *
   * This method checks if an account is selected, then delegates the deletion to the specific blockchain type based on the provided options.
   *
   * @returns {Promise<any>} A promise that resolves with the result of the deletion operation.
   * @throws {`ValidationError`} If no account is selected.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   */
  @expose
  @validateInput
  async delete(): Promise<any> {
    if (!this.current_account) throw new ValidationError(`No account is selected. Please select an account first.`);

    const options: BlockchainDeleteModel = { name: this.current_account };

    return this[this.blockchain_type].delete(options);
  }
}

export { Blockchain as blockchain };
