import { Client, QueryClient } from "./client";

interface Balance {
  free: number;
  reserved: number;
  miscFrozen: number;
  feeFrozen: number;
}

interface QueryBalancesGetOptions {
  address: string;
}

class QueryBalances {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  async get(options: QueryBalancesGetOptions): Promise<Balance> {
    const { data } = await this.client.checkConnectionAndApply(this.client.api.query.system.account, [options.address]);
    const balance: Balance = {
      free: data.free.toJSON(),
      reserved: data.reserved.toJSON(),
      miscFrozen: data.miscFrozen.toJSON(),
      feeFrozen: data.feeFrozen.toJSON(),
    };
    return balance;
  }

  /**
   * Checks if the specified key in the event data matches the provided value.
   * @private
   * @param {string} key - The key to compare in the event data.
   * @param {string} value - The value to compare against the key in the event data.
   * @param {object} eventData - The event data object to check.
   * @returns {boolean} Returns true if the key in the event data matches the provided value, otherwise false.
   */
  private mintCheck(key: string, value: string, eventData: object): boolean {
    if (eventData[0][key].toPrimitive() === value) return true;
    else return false;
  }

  /**
   * Listens for the "MintCompleted" event on the TFT Bridge Module and resolves when the specified key-value pair is validated in the event data.
   * @param {"target" | "amount"} key - The key to validate in the event data ("target" or "amount").
   * @param {string} value - The expected value of the validated key in the event data.
   * @returns {Promise<object>} A promise that resolves with the event data when the specified key-value pair is validated in the event data.
   */
  async listenToMintCompleted(key: "target" | "amount", value: string): Promise<object> {
    return await this.client.listenForEvent(
      this.client.api,
      "tftBridgeModule",
      "MintCompleted",
      key,
      value,
      this.mintCheck,
    );
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
    return this.get({ address: this.client.address });
  }
}

export { Balances, QueryBalances, Balance };
