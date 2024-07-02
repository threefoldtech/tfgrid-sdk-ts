import { generatePublicKey } from "@threefold/rmb_direct_client";
import { ExtrinsicResult, Twin, Twins } from "@threefold/tfchain_client";

interface TwinOptions {
  relay: string;
}

/**
 * TFTwins class represents a specialized class that extends the Twins class.
 * It provides methods to create and update twins with additional functionality to generate public keys.
 *
 * @extends Twins
 */
class TFTwins extends Twins {
  /**
   * Creates a new `twin` with the specified options.
   *
   * @param options - The options for creating the `twin`, including the `relay` to connect to.
   * @returns {Promise<ExtrinsicResult<Twin>>} A promise that resolves with the created `twin`.
   */
  async create(options: TwinOptions): Promise<ExtrinsicResult<Twin>> {
    const pk = generatePublicKey(this.client.mnemonicOrSecret!);
    return super.create({ pk, relay: options.relay });
  }

  /**
   * Updates an existing `twin` with the specified options.
   *
   * @param options - The options for updating the `twin`, including the `relay` to connect to.
   * @returns {Promise<ExtrinsicResult<Twin>>} A promise that resolves with the updated `twin`.
   */
  async update(options: TwinOptions): Promise<ExtrinsicResult<Twin>> {
    const pk = generatePublicKey(this.client.mnemonicOrSecret!);
    return super.update({ pk, relay: options.relay });
  }
}

export { TFTwins };
