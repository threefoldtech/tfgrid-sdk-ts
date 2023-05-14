import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { ISubmittableResult } from "@polkadot/types/types";

import { Client } from "./client";

class Utility {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async batch<T>(extrinsics: SubmittableExtrinsic<"promise", ISubmittableResult>[]): Promise<T> {
    if (extrinsics.length > 0) {
      const resultSections = this.extractResultSections(extrinsics);
      const batchExtrinsic = await this.client.checkConnectionAndApply(this.client.api.tx.utility.batch, [extrinsics]);
      return this.client.applyExtrinsic<T>(batchExtrinsic, resultSections);
    }
  }

  async batchAll<T>(extrinsics: SubmittableExtrinsic<"promise", ISubmittableResult>[]): Promise<T> {
    if (extrinsics.length > 0) {
      const resultSections = this.extractResultSections(extrinsics);
      const batchAllExtrinsic = await this.client.checkConnectionAndApply(this.client.api.tx.utility.batchAll, [
        extrinsics,
      ]);
      return this.client.applyExtrinsic<T>(batchAllExtrinsic, resultSections);
    }
  }

  private extractResultSections(extrinsics: SubmittableExtrinsic<"promise", ISubmittableResult>[]) {
    const resultSections: string[] = [];
    for (const extrinsic of extrinsics) {
      resultSections.push(extrinsic.method.section);
    }
    return resultSections;
  }
}

export { Utility };
