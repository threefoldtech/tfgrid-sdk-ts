import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { ISubmittableResult } from "@polkadot/types/types";

import { Client, QueryClient } from "./client";

interface Twin {
  id: number;
  accountId: string;
  relay: string;
  entities: string[];
  pk: string;
}

class QueryTwins {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  async get(id: number): Promise<Twin> {
    if (isNaN(id) || id <= 0) {
      throw Error("Invalid twin id. Twin id must be postive integer");
    }
    const res = await this.client.checkConnectionAndApply(this.client.api.query.tfgridModule.twins, [id]);
    return res.toPrimitive();
  }

  async getTwinIdByAccountId(accountId: string): Promise<number> {
    const res = await this.client.checkConnectionAndApply(this.client.api.query.tfgridModule.twinIdByAccountID, [
      accountId,
    ]);
    return res.toPrimitive();
  }
}

class Twins extends QueryTwins {
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }

  async createExtrinsic(relay: string, pk: string): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    return this.client.checkConnectionAndApply(this.client.api.tx.tfgridModule.createTwin, [relay, pk]);
  }

  async create(relay: string, pk: string): Promise<void> {
    const extrinsic = await this.createExtrinsic(relay, pk);
    return this.client.applyExtrinsic<void>(extrinsic);
  }

  async updateExtrinsic(relay: string, pk: string): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    return this.client.checkConnectionAndApply(this.client.api.tx.tfgridModule.updateTwin, [relay, pk]);
  }

  async update(relay: string, pk: string): Promise<Twin> {
    const extrinsic = await this.updateExtrinsic(relay, pk);
    return this.client.applyExtrinsic<Twin>(extrinsic);
  }

  async getMyTwinId(): Promise<number> {
    return this.getTwinIdByAccountId(this.client.address);
  }
}

export { Twins, QueryTwins, Twin };
