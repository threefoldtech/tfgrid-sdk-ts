import { ExtrinsicResult, Farm, Farms } from "@threefold/tfchain_client";

import { RemoveFarmIPModel } from "../../modules";
/**
 * Removes farm IPs
 *
 * @param {RemoveFarmIPModel[]} options - An array of options to remove farm IPs
 * @returns {Promise<void>} A promise that resolves when all extrinsics have been applied
 * @see {applyAllExtrinsics} - The method used to apply all extrinsics
 */
class TFFarms extends Farms {
  async removeFarmIps(options: RemoveFarmIPModel[]) {
    const extrinsics: ExtrinsicResult<Farm>[] = [];
    for (const option of options) {
      extrinsics.push(await this.removeFarmIp(option));
    }
    await this.client.applyAllExtrinsics(extrinsics);
  }
}

export { TFFarms };
