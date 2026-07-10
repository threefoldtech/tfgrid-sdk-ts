import { QueryClient } from "./client";
import { checkConnection } from "./utils";

class QueryTFTPrice {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  @checkConnection
  async get(): Promise<number> {
    const res = await this.client.api.query.tftPriceModule.tftPrice();
    return res.toPrimitive() as number;
  }

  @checkConnection
  async getTFTBillingRateMUSD(): Promise<number> {
    const [minRes, maxRes, avgRes] = await Promise.all([
      this.client.api.query.tftPriceModule.minTftPrice(),
      this.client.api.query.tftPriceModule.maxTftPrice(),
      this.client.api.query.tftPriceModule.averageTftPrice(),
    ]);

    const minPrice = minRes.toPrimitive();
    const maxPrice = maxRes.toPrimitive();
    const averagePrice = avgRes.toPrimitive();

    if (typeof minPrice !== "number" || isNaN(minPrice)) {
      throw new Error("Failed to retrieve minimum TFT price: invalid value returned");
    }
    if (typeof maxPrice !== "number" || isNaN(maxPrice)) {
      throw new Error("Failed to retrieve maximum TFT price: invalid value returned");
    }
    if (typeof averagePrice !== "number" || isNaN(averagePrice)) {
      throw new Error("Failed to retrieve average TFT price: invalid value returned");
    }

    // Clamp the average between the configured bounds, matching on-chain billing logic
    return this.clampTFTPrice(averagePrice, minPrice, maxPrice);
  }

  /**
   * tft_price = max(AverageTftPrice, MinTftPrice) then min(_, MaxTftPrice)
   */
  private clampTFTPrice(avg: number, min: number, max: number): number {
    let rate = avg;
    if (rate < min) {
      rate = min;
    }
    if (rate > max) {
      rate = max;
    }
    return rate;
  }
}

export { QueryTFTPrice };
