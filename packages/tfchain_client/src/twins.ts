import { Client, QueryClient } from "./client";
import { checkConnection } from "./utils";

interface Twin {
  id: number;
  accountId: string;
  relay: string;
  entities: string[];
  pk: string;
}

interface QueryTwinsGetOptions {
  id: number;
}

interface QueryTwinsGetTwinByAccountIdOptions {
  accountId: string;
}

class QueryTwins {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  @checkConnection
  async get(options: QueryTwinsGetOptions): Promise<Twin> {
    if (isNaN(options.id) || options.id <= 0) {
      throw Error("Invalid twin id. Twin id must be positive integer");
    }
    const res = await this.client.api.query.tfgridModule.twins(options.id);
    return res.toPrimitive() as unknown as Twin;
  }

  @checkConnection
  async getTwinIdByAccountId(options: QueryTwinsGetTwinByAccountIdOptions): Promise<number> {
    const res = await this.client.api.query.tfgridModule.twinIdByAccountID(options.accountId);
    return res.toPrimitive() as number;
  }
}

export interface TwinOptions {
  relay: string;
  pk: string;
}

class Twins extends QueryTwins {
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }

  @checkConnection
  async create(options: TwinOptions) {
    const extrinsic = await this.client.api.tx.tfgridModule.createTwin(options.relay, options.pk);
    return this.client.patchExtrinsic<Twin>(extrinsic);
  }

  @checkConnection
  async update(options: TwinOptions) {
    const extrinsic = await this.client.api.tx.tfgridModule.updateTwin(options.relay, options.pk);
    return this.client.patchExtrinsic<Twin>(extrinsic);
  }

  @checkConnection
  async getMyTwinId(): Promise<number> {
    return this.getTwinIdByAccountId({ accountId: this.client.address });
  }
}

export { Twins, QueryTwins, Twin };
