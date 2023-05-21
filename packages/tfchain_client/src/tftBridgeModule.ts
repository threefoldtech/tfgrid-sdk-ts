import { QueryClient } from "./client";
class QueryTFTBridge {
  constructor(public client: QueryClient) {
    this.client = client;
  }
  /**
   * Checks if the specified key in the event data matches the provided value.
   * @private
   * @param {string} [key="target"] - The key to validate in the event data.
   * @param {string} address - The expected value of the validated key in the event data.
   * @param {object} eventData - The event data object to check.
   * @returns {boolean} Returns true if the key in the event data matches the provided value, otherwise false.
   */
  private mintCheck(key = "target", address: string, eventData: object): boolean {
    if (eventData[0][key].toPrimitive() === address) return true;
    else return false;
  }

  /**
   * Listens for the "MintCompleted" event on the TFT Bridge Module and resolves when the specified key-value pair is validated in the event data.
   *
   * @param {string} address - The expected value of the validated key in the event data.
   * @returns {Promise<number>} A promise that resolves with the amount TFT transferred from the bridge.
   * @throws {Error} If the section or method is not defined on the chain, or if an error occurs during validation.
   * @rejects {string} If no response is received within the given time or if an error occurs during validation.
   */
  async listenToMintCompleted(address: string): Promise<number> {
    const eventData = (await this.client.listenForEvent(
      "tftBridgeModule",
      "MintCompleted",
      "target",
      address,
      this.mintCheck,
    )) as object;
    return eventData[0].amount.toPrimitive();
  }
}
export { QueryTFTBridge };
