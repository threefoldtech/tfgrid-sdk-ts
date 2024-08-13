import { Client } from "./client";
import { ExtrinsicResult } from "./types";
import { checkConnection } from "./utils";

const BATCH_SIZE = 400;
class Utility {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  @checkConnection
  async batch<T>(extrinsics: ExtrinsicResult<T>[]): Promise<T[]> {
    extrinsics = extrinsics.filter(Boolean);
    if (extrinsics.length > 0) {
      let result: T[] = [];
      for (let i = 0; i < extrinsics.length; i += BATCH_SIZE) {
        const batch = extrinsics.slice(i, i + BATCH_SIZE);
        const { resultSections, resultEvents, map } = this.extractResultSectionsAndEvents(batch);
        const batchExtrinsic = await this.client.api.tx.utility.batch(batch);
        const res = await this.client.applyExtrinsic<T>(batchExtrinsic, resultSections, resultEvents, map);
        result = result.concat(res);
      }

      return result;
    }
    return [];
  }

  @checkConnection
  async batchAll<T>(extrinsics: ExtrinsicResult<T>[]): Promise<T[]> {
    extrinsics = extrinsics.filter(Boolean);
    if (extrinsics.length > 0) {
      let result: T[] = [];
      for (let i = 0; i < extrinsics.length; i += BATCH_SIZE) {
        const batch = extrinsics.slice(i, i + BATCH_SIZE);
        const { resultSections, resultEvents, map } = this.extractResultSectionsAndEvents(batch);
        const batchAllExtrinsic = await this.client.api.tx.utility.batchAll(batch);
        const res = await this.client.applyExtrinsic<T>(batchAllExtrinsic, resultSections, resultEvents, map);
        result = result.concat(res);
      }

      return result;
    }
    return [];
  }

  private extractResultSectionsAndEvents<T>(extrinsics: ExtrinsicResult<T>[]) {
    let resultEvents: string[] = [];
    let resultSections: string[] = [];
    let map: ((value: unknown) => T) | undefined = undefined;
    for (const extrinsic of extrinsics) {
      if (extrinsic.resultSections && extrinsic.resultSections.length > 0)
        resultSections = resultSections.concat(extrinsic.resultSections);
      resultSections.push(extrinsic.method.section);
      if (extrinsic.resultEvents && extrinsic.resultEvents.length > 0)
        resultEvents = resultEvents.concat(extrinsic.resultEvents);
      if (extrinsic.map) map = extrinsic.map;
    }

    return { resultSections, resultEvents, map };
  }
}

export { Utility };
