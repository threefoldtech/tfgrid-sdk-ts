import { Keyring } from "@polkadot/keyring";
import { Balance, Balances, BalanceTransferOptions, QueryBalancesGetOptions } from "@threefold/tfchain_client";
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

  async getMoreFunds(address: string, callback: any) {
    const keyring = new Keyring({ type: "sr25519" });
    const alice = keyring.addFromUri("//Alice");
    const transaction = await super.transfer({ address: address, amount: 100 * 1e7 });
    transaction.signAndSend(alice, callback);
  }
}

export { TFBalances };
