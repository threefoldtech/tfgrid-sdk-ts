import { Client, QueryClient } from "./client";
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

class Balances extends QueryBalances {
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }

  @checkConnection
  async transfer(options: BalanceTransferOptions) {
    if (isNaN(options.amount) || options.amount <= 0) {
      throw Error("Amount must be a positive numeric value");
    }

    const extrinsic = await this.client.api.tx.balances.transfer(options.address, options.amount);
    return this.client.patchExtrinsic(extrinsic, { map: () => options.amount });
  }

  @checkConnection
  async getMyBalance(): Promise<Balance> {
    return this.get({ address: this.client.address });
  }
}

export { Balances, QueryBalances, Balance };
