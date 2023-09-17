import { Keyring } from "@polkadot/keyring";
import { Balance, Balances, BalanceTransferOptions, Client, QueryBalancesGetOptions } from "@threefold/tfchain_client";
import { Decimal } from "decimal.js";

class TFBalances extends Balances {
  async get(options: QueryBalancesGetOptions): Promise<Balance> {
    const balances = await super.get(options);
    for (const b of Object.keys(balances)) {
      const balance = new Decimal(balances[b]);
      balances[b] = balance.div(10 ** 7).toNumber();
    }
    return balances;
  }

  async transfer(options: BalanceTransferOptions) {
    const decimalAmount = new Decimal(options.amount);
    const decimalAmountInTFT = decimalAmount.mul(10 ** 7).toNumber();
    return await super.transfer({ address: options.address, amount: decimalAmountInTFT });
  }

  async getMoreFunds() {
    const client = new Client({ url: this.client.url, mnemonicOrSecret: "//Alice" });
    client.connect();
    return (await client.balances.transfer({ address: this.client.address, amount: 100 * 1e7 })).apply();
  }
}

export { TFBalances };
