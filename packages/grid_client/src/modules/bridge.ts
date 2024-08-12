import { TFClient } from "../clients";
import { GridClientConfig } from "../config";
import { expose, validateInput } from "../helpers";
import { ListenToMintCompletedModel, SwapToStellarModel } from "./models";

class Bridge {
  client: TFClient;

  /**
   * Class representing a Bridge for interacting with TFChain's TFTBridge functionality.
   *
   * This class provides methods for listening to mint completion, getting withdrawal and deposit fees,
   * and swapping assets to Stellar network.
   *
   * @param {GridClientConfig} config - The configuration object containing necessary parameters for the Bridge.
   */
  constructor(public config: GridClientConfig) {
    this.client = config.tfclient;
  }

  /**
   * Asynchronously listens to the completion of minting process for a specific address.
   *
   * @param {ListenToMintCompletedModel} options - The options object containing the address to listen for mint completion.
   * @returns {Promise<number>} A promise that resolves with the result of listening to mint completion.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async listenToMintCompleted(options: ListenToMintCompletedModel): Promise<number> {
    return await this.client.tftBridge.listenToMintCompleted(options.address);
  }

  /**
   * Asynchronously retrieves the withdrawal fee from the TFClient's TFTBridge.
   *
   * This method fetches the withdrawal fee associated with using the TFTBridge for transactions.
   *
   * @returns {Promise<number>} A promise that resolves with the withdrawal fee amount.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters.
   */
  @expose
  @validateInput
  async getWithdrawFee(): Promise<number> {
    return await this.client.tftBridge.getWithdrawFee();
  }

  /**
   * Asynchronously retrieves the deposit fee from the TFClient's TFTBridge.
   *
   * This method fetches the deposit fee associated with using the TFTBridge for transactions.
   *
   * @returns {Promise<number>} A promise that resolves with the deposit fee amount.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters.
   */
  @expose
  @validateInput
  async getDepositFee(): Promise<number> {
    return await this.client.tftBridge.getDepositFee();
  }

  /**
   * Asynchronously initiates a swap of assets to the Stellar network using the TFClient's TFTBridge.
   *
   * This method triggers the swap process for a specified target address and amount, converting assets to Stellar network tokens.
   *
   * @param {SwapToStellarModel} options - The options object containing the target address and amount for the swap.
   * @returns {Promise<any>} A promise that resolves with the result of the swap operation.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async swapToStellar(options: SwapToStellarModel): Promise<any> {
    return await (await this.client.tftBridge.swapToStellar(options)).apply();
  }
}

export { Bridge as bridge };
