import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { ISubmittableResult } from "@polkadot/types/types";

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

class Balances extends QueryBalances {
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }

  async transferExtrinsic(
    address: string,
    amount: number,
  ): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    if (isNaN(amount) || amount <= 0) {
      throw Error("Amount must be a positive numeric value");
    }
    return this.client.checkConnectionAndApply(this.client.api.tx.balances.transfer, [address, amount]);
  }

  async transfer(address: string, amount: number): Promise<number> {
    const extrinsic = await this.transferExtrinsic(address, amount);
    await this.client.applyExtrinsic(extrinsic);
    return amount;
  }

  async getMyBalance(): Promise<Balance> {
    return this.get(this.client.address);
  }
}

export { Balances, QueryBalances, Balance };
