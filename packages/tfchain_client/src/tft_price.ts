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
  async getTFTBillingRate(): Promise<number> {
    const [minRes, maxRes, avgRes] = await Promise.all([
      this.client.api.query.tftPriceModule.minTftPrice(),
      this.client.api.query.tftPriceModule.maxTftPrice(),
      this.client.api.query.tftPriceModule.averageTftPrice(),
    ]);

    const minPrice = (minRes.toPrimitive() as number) ?? 0;
    const maxPrice = (maxRes.toPrimitive() as number) ?? 0;
    const averagePrice = (avgRes.toPrimitive() as number) ?? 0;

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
