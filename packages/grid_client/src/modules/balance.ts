import { Balance as TFChainBalance } from "@threefold/tfchain_client";

import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { BalanceGetModel, BalanceTransferModel } from "./models";
import { checkBalance } from "./utils";

class Balance {
  client: TFClient;

  /**
   * Represents a class for managing balances and transfers.
   *
   * @param {GridClientConfig} config - The configuration object for the GridClient.
   */
  constructor(public config: GridClientConfig) {
    this.client = config.tfclient;
  }

  /**
   * Retrieves the `balance` information based on the provided options.
   *
   * @param {BalanceGetModel} options - The options for retrieving the balance information.
   * @returns {Promise<TFChainBalance>} A promise that resolves with the balance information.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async get(options: BalanceGetModel): Promise<TFChainBalance> {
    return await this.client.balances.get(options);
  }

  /**
   * Transfers the balance based on the provided options.
   *
   * This method first checks the balance to ensure it is enough to apply an extrinsic transfer.
   * If the balance is sufficient, it throw an error instead.
   *
   * @param {BalanceTransferModel} options - The options for the balance transfer.
   * @returns {Promise<number>} A promise that resolves with the `transfer balance`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance before proceeding.
   */
  @expose
  @validateInput
  @checkBalance
  async transfer(options: BalanceTransferModel): Promise<number> {
    return await (await this.client.balances.transfer(options)).apply();
  }

  /**
   * Retrieves the balance information for the current user.
   *
   * This method fetches the balance information for the current user from the TFChain.
   *
   * @returns {Promise<TFChainBalance>} A promise that resolves with the balance information of the current user.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getMyBalance(): Promise<TFChainBalance> {
    return await this.client.balances.getMyBalance();
  }

  /**
   * Fund the wallet with `100TFT` on `Dev | QA` nets for the current user.
   *
   * This method fetches additional funds for the current user from the TFChain.
   *
   * @returns {Promise<number>} A promise that resolves once the funds are successfully retrieved.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getMoreFunds(): Promise<number> {
    return await this.client.balances.getMoreFunds();
  }
}

export { Balance as balance };
