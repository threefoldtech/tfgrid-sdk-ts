import { generatePublicKey } from "@threefold/rmb_direct_client";

import { TFClient } from "./client";

class Twins {
  tfclient: TFClient;

  constructor(client: TFClient) {
    this.tfclient = client;
  }

  async create(relay: string) {
    const pk = generatePublicKey(this.tfclient.mnemonic);
    return this.tfclient.applyExtrinsic(this.tfclient.client.createTwin, [relay, pk], "tfgridModule", ["TwinStored"]);
  }

  async update(relay: string) {
    const pk = generatePublicKey("0xd295609611604aaffd54e3b472b62a11cf9c4a300ffc31c18631e2d31e0746b6");

    return this.tfclient.applyExtrinsic(this.tfclient.client.updateTwin, [relay, pk], "tfgridModule", ["TwinUpdated"]);
  }

  async get(id: number) {
    return await this.tfclient.queryChain(this.tfclient.client.getTwinByID, [id]);
  }

  async getMyTwinId(): Promise<number> {
    await this.tfclient.connect();
    const pubKey = this.tfclient.client.address;
    return this.getTwinIdByAccountId(pubKey);
  }

  async getTwinIdByAccountId(publicKey: string): Promise<number> {
    return await this.tfclient.queryChain(this.tfclient.client.getTwinIdByAccountId, [publicKey]);
  }

  async list() {
    return await this.tfclient.queryChain(this.tfclient.client.listTwins, []);
  }

  async delete(id: number) {
    return this.tfclient.applyExtrinsic(this.tfclient.client.deleteTwin, [id], "tfgridModule", ["TwinDeleted"]);
  }
}

export { Twins };
