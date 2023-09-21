import { Client, QueryClient } from "./client";
import { checkConnection } from "./utils";

export interface SwapToStellarOptions {
  target: string;
  amount: number;
}

class QueryBridge {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  /**
   * Listens for the "MintCompleted" event on the TFT Bridge Module and resolves when the specified key-value pair is validated in the event data.
   *
   * @param {string} address - The expected value of the validated key in the event data.
   * @param {number} timeoutInMinutes - The timeout value in minutes. Default is 2 minutes.
   * @returns {Promise<number>} A promise that resolves with the amount TFT transferred from the bridge.
   * @throws {Error} If the section or method is not defined on the chain, or if an error occurs during validation.
   * @rejects {string} If no response is received within the given time or if an error occurs during validation.
   */
  @checkConnection
  async listenToMintCompleted(address: string, timeoutInMinutes = 2) {
    function mintCheck(eventData: unknown): boolean {
      if ((eventData as [{ [key: string]: { toPrimitive(): string } }])[0]["target"].toPrimitive() === address)
        return true;
      else return false;
    }
    const eventData = await this.client.listenForEvent<{ amount: { toPrimitive(): number } }[]>(
      "tftBridgeModule",
      "MintCompleted",
      mintCheck,
      timeoutInMinutes,
    );
    return eventData[0].amount.toPrimitive();
  }

  @checkConnection
  async getWithdrawFee(): Promise<number> {
    const fee = await this.client.api.query.tftBridgeModule.withdrawFee();
    return fee.toPrimitive() as number;
  }

  @checkConnection
  async getDepositFee(): Promise<number> {
    const fee = await this.client.api.query.tftBridgeModule.depositFee();
    return fee.toPrimitive() as number;
  }
}

class Bridge extends QueryBridge {
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }

  @checkConnection
  async swapToStellar(options: SwapToStellarOptions) {
    const extrinsic = await this.client.api.tx.tftBridgeModule.swapToStellar(options.target, options.amount);
    return this.client.patchExtrinsic<void>(extrinsic);
  }
}
export { QueryBridge, Bridge };
