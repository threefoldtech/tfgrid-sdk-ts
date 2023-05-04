import { Client, QueryClient } from "./client";

interface Balance {
  free: number;
  reserved: number;
  miscFrozen: number;
  feeFrozen: number;
}

class QueryBalances {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  async get(address: string): Promise<Balance> {
    const { data } = await this.client.checkConnectionAndApply(this.client.api.query.system.account, [address]);
    const balance: Balance = {
      free: data.free.toJSON(),
      reserved: data.reserved.toJSON(),
      miscFrozen: data.miscFrozen.toJSON(),
      feeFrozen: data.feeFrozen.toJSON(),
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

  async transfer(options: BalanceTransferOptions) {
    if (isNaN(options.amount) || options.amount <= 0) {
      throw Error("Amount must be a positive numeric value");
    }

    const extrinsic = await this.client.checkConnectionAndApply(this.client.api.tx.balances.transfer, [
      options.address,
      options.amount,
    ]);

    return this.client.patchExtrinsic(extrinsic, { map: () => options.amount });
  }

  async getMyBalance(): Promise<Balance> {
    return this.get(this.client.address);
  }
}

export { Balances, QueryBalances, Balance };
