import { QueryClient } from "./client";
class QueryTFTBridge {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  /**
   * Listens for the "MintCompleted" event on the TFT Bridge Module and resolves when the specified key-value pair is validated in the event data.
   *
   * @param {string} address - The expected value of the validated key in the event data.
   * @returns {Promise<number>} A promise that resolves with the amount TFT transferred from the bridge.
   * @throws {Error} If the section or method is not defined on the chain, or if an error occurs during validation.
   * @rejects {string} If no response is received within the given time or if an error occurs during validation.
   */
  async listenToMintCompleted(address: string) {
    const eventData = await this.client.listenForEvent<{ amount: { toPrimitive(): number } }[]>(
      "tftBridgeModule",
      "MintCompleted",
      "target",
      address,
      (key = "target", address: string, eventData: unknown): boolean => {
        if ((eventData as [{ [key: string]: { toPrimitive(): string } }])[0][key].toPrimitive() === address)
          return true;
        else return false;
      },
    );
    return eventData[0].amount.toPrimitive();
  }
}
export { QueryTFTBridge };
