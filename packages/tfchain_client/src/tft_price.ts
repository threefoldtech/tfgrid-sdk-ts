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
}

export { QueryTFTPrice };
