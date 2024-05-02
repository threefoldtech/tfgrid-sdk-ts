import { ExtrinsicResult, Farm, Farms } from "@threefold/tfchain_client";

import { RemoveFarmIPModel } from "../../modules";

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
