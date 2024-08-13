import {
  Balance,
  Balances,
  BalanceTransferOptions,
  Client,
  ExtrinsicResult,
  QueryBalancesGetOptions,
} from "@threefold/tfchain_client";
import { GridClientError } from "@threefold/types";
import { Decimal } from "decimal.js";

class TFBalances extends Balances {
  /**
   * Get the balance for a specific address.
   *
   * This method retrieves the balance for a specific address in TFT.
   *
   * @param {QueryBalancesGetOptions} options - The options for getting the balance, including the address.
   * @returns {Promise<Balance>} A promise that resolves with the balance object containing free, reserved, and frozen amounts.
   */
  async get(options: QueryBalancesGetOptions): Promise<Balance> {
    const balances = await super.get(options);
    for (const b of Object.keys(balances)) {
      const balance = new Decimal(balances[b]);
      balances[b] = balance.div(10 ** 7).toNumber();
    }
    return balances;
  }

  /**
   * Prepare a Transfer extrinsic for a specified amount of TFT (`ThreeFold Tokens`) to a given address.
   *
   * @param {BalanceTransferOptions} options - The transfer options, including the destination address and the amount to transfer.
   * @returns {Promise<ExtrinsicResult<number>>} A promise that resolves once the transfer extrinsic is created.
   */
  async transfer(options: BalanceTransferOptions): Promise<ExtrinsicResult<number>> {
    const decimalAmount = new Decimal(options.amount);
    const decimalAmountInTFT = decimalAmount.mul(10 ** 7).toNumber();
    return await super.transfer({ address: options.address, amount: decimalAmountInTFT });
  }

  /**
   * Fund the wallet with `100TFT` on `Dev | QA` nets for the current user.
   *
   * This method fetches additional funds for the current user from the TFChain.
   *
   * @returns {Promise<number>} A promise that resolves once the funds are successfully retrieved.
   */
  async getMoreFunds(): Promise<number> {
    if (!this.client.url.includes("qa") && !this.client.url.includes("dev")) {
      throw new GridClientError("Unable to get more TFTs.");
    }
    await this.client.connect();
    const client = new Client({ url: this.client.url, mnemonicOrSecret: "//Alice" });
    await client.connect();
    const transaction = await client.balances.transfer({ address: this.client.address, amount: 100 * 1e7 });
    return transaction.apply();
  }
}

export { TFBalances };
