import { ValidationError } from "@threefold/types";

import { Client, QueryClient } from "./client";
import { ExtrinsicResult } from "./types";
import { checkConnection } from "./utils";

interface Balance {
  free: number;
  reserved: number;
  frozen: number;
}

export interface QueryBalancesGetOptions {
  address: string;
}

class QueryBalances {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  @checkConnection
  async get(options: QueryBalancesGetOptions): Promise<Balance> {
    const res = await this.client.api.query.system.account(options.address);
    const balance: Balance = {
      free: res["data"].free.toJSON(),
      reserved: res["data"].reserved.toJSON(),
      frozen: res["data"].frozen.toJSON(),
    };
    return balance;
  }
}

export interface BalanceTransferOptions {
  address: string;
  amount: number;
}

export interface BalanceForceTransferOptions {
  source: string;
  dest: string;
  amount: number;
}

class Balances extends QueryBalances {
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }

  @checkConnection
  async transfer(options: BalanceTransferOptions) {
    if (isNaN(options.amount) || options.amount <= 0) {
      throw new ValidationError("Amount must be a positive numeric value");
    }

    const extrinsic = await this.client.api.tx.balances.transfer(options.address, options.amount);
    return this.client.patchExtrinsic(extrinsic, { map: () => options.amount });
  }

  /**
   * Prepare a force transfer extrinsic for a specified amount of TFT (`ThreeFold Tokens`) from the source address to the dest address.
   * It's a council call that can't be executed by a normal user.
   *
   * @param {BalanceForceTransferOptions} options - The transfer options, including the source and destination addresses and the amount to transfer.
   * @returns {Promise<ExtrinsicResult<number>>} A promise that resolves once the transfer extrinsic is created.
   */
  @checkConnection
  async forceTransfer(options: BalanceForceTransferOptions): Promise<ExtrinsicResult<number>> {
    if (isNaN(options.amount) || options.amount <= 0) {
      throw new ValidationError("The amount must be a positive numeric value");
    }

    const extrinsic = await this.client.api.tx.balances.forceTransfer(options.source, options.dest, options.amount);
    return this.client.patchExtrinsic<number>(extrinsic, { map: () => options.amount });
  }

  @checkConnection
  async getMyBalance(): Promise<Balance> {
    return this.get({ address: this.client.address });
  }
}

export { Balances, QueryBalances, Balance };
