import { QueryTFTPrice } from "@threefold/tfchain_client";

class TFTPrice extends QueryTFTPrice {
  async get(): Promise<number> {
    const priceInMili = await this.client.tftPrice.get();
    return priceInMili / 1000;
  }
}

export { TFTPrice };
