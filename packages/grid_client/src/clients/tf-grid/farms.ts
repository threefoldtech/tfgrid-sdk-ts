import { ExtrinsicResult, Farm, Farms } from "@threefold/tfchain_client";

import { RemoveFarmIPModel } from "../../modules";

/**
 * `TFFarms` is a subclass of `Farms` that provides additional functionality.
 */
class TFFarms extends Farms {
  /**
   * Removes farm IPs
   *
   * @param {RemoveFarmIPModel[]} options - An array of options used to remove farm IPs
   * @returns {Promise<void>} A promise that resolves when all extrinsics have been applied
   * @see {applyAllExtrinsics} - The method used to apply all extrinsics
   */
  async removeFarmIps(options: RemoveFarmIPModel[]) {
    const extrinsics: ExtrinsicResult<Farm>[] = [];
    for (const option of options) {
      extrinsics.push(await this.removeFarmIp(option));
    }
    await this.client.applyAllExtrinsics(extrinsics);
  }
}

export { TFFarms };
