import { Client } from "./client";
import { ExtrinsicResult } from "./types";
import { checkConnection } from "./utils";

class Utility {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  @checkConnection
  async batch<T>(extrinsics: ExtrinsicResult<T>[]): Promise<T[]> {
    if (extrinsics.length > 0) {
      const { resultSections, resultEvents } = this.extractResultSectionsAndEvents(extrinsics);
      const batchExtrinsic = await this.client.api.tx.utility.batch(extrinsics);
      return this.client.applyExtrinsic<T[]>(batchExtrinsic, resultSections, resultEvents);
    }
    return [];
  }

  @checkConnection
  async batchAll<T>(extrinsics: ExtrinsicResult<T>[]): Promise<T[]> {
    if (extrinsics.length > 0) {
      const { resultSections, resultEvents } = this.extractResultSectionsAndEvents(extrinsics);
      const batchAllExtrinsic = await this.client.api.tx.utility.batchAll(extrinsics);
      return this.client.applyExtrinsic<T[]>(batchAllExtrinsic, resultSections, resultEvents);
    }
    return [];
  }

  private extractResultSectionsAndEvents<T>(extrinsics: ExtrinsicResult<T>[]) {
    let resultEvents: string[] = [];
    let resultSections: string[] = [];
    for (const extrinsic of extrinsics) {
      if (extrinsic.resultSections && extrinsic.resultSections.length > 0)
        resultSections = resultSections.concat(extrinsic.resultSections);
      resultSections.push(extrinsic.method.section);
      if (extrinsic.resultEvents && extrinsic.resultEvents.length > 0)
        resultEvents = resultEvents.concat(extrinsic.resultEvents);
    }

    return { resultSections, resultEvents };
  }
}

export { Utility };
