import { QueryTFTPrice } from "@threefold/tfchain_client";

class TFTPrice extends QueryTFTPrice {
  async get(): Promise<number> {
    const priceInMili = await super.get();
    return priceInMili / 1000;
  }

  async getTFTBillingRateUSD(): Promise<number> {
    const priceInMili = await super.getTFTBillingRateMUSD();
    return priceInMili / 1000;
  }
}

export { TFTPrice };
