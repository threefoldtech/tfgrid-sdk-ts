import { Client, QueryClient } from "./client";

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

  async get(options: QueryTwinsGetOptions): Promise<Twin> {
    if (isNaN(options.id) || options.id <= 0) {
      throw Error("Invalid twin id. Twin id must be postive integer");
    }
    const res = await this.client.checkConnectionAndApply(this.client.api.query.tfgridModule.twins, [options.id]);
    return res.toPrimitive();
  }

  async getTwinIdByAccountId(options: QueryTwinsGetTwinByAccountIdOptions): Promise<number> {
    const res = await this.client.checkConnectionAndApply(this.client.api.query.tfgridModule.twinIdByAccountID, [
      options.accountId,
    ]);
    return res.toPrimitive();
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

  async create(options: TwinOptions) {
    const extrinsic = await this.client.checkConnectionAndApply(this.client.api.tx.tfgridModule.createTwin, [
      options.relay,
      options.pk,
    ]);
    return this.client.patchExtrinsic<void>(extrinsic);
  }

  async updateExtrinsic(options: TwinOptions) {
    const extrinsic = await this.client.checkConnectionAndApply(this.client.api.tx.tfgridModule.updateTwin, [
      options.relay,
      options.pk,
    ]);
    return this.client.patchExtrinsic<Twin>(extrinsic);
  }

  async getMyTwinId(): Promise<number> {
    return this.getTwinIdByAccountId({ accountId: this.client.address });
  }
}

export { Twins, QueryTwins, Twin };
