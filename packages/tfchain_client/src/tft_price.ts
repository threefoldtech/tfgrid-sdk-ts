import { QueryClient } from "./client";

class QueryTFTPrice {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  async get(): Promise<number> {
    const res = await this.client.checkConnectionAndApply(this.client.api.query.tftPriceModule.tftPrice, []);
    return res.toPrimitive();
  }
}

export { QueryTFTPrice };
