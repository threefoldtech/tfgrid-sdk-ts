import { Balance, Balances, BalanceTransferOptions, QueryBalancesGetOptions } from "@threefold/tfchain_client";
import { Decimal } from "decimal.js";

class TFBalances extends Balances {
  async get(options: QueryBalancesGetOptions): Promise<Balance> {
    const balances = await this.client.balances.get(options);
    for (const b of Object.keys(balances)) {
      const balance = new Decimal(balances[b]);
      balances[b] = balance.div(10 ** 7).toNumber();
    }
    return balances;
  }

  async transfer(options: BalanceTransferOptions) {
    const decimalAmount = new Decimal(options.amount);
    const decimalAmountInTFT = decimalAmount.mul(10 ** 7).toNumber();
    return await this.client.balances.transfer({ address: options.address, amount: decimalAmountInTFT });
  }
}

export { TFBalances };
