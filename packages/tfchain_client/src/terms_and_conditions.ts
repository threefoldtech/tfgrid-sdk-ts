import { Client } from "./client";
import { checkConnection } from "./utils";

export interface AcceptOptions {
  documentLink: string;
  documentHash: string;
}

class TermsAndConditions {
  constructor(public client: Client) {
    this.client = client;
  }

  @checkConnection
  async accept(options: AcceptOptions) {
    const extrinsic = await this.client.api.tx.tfgridModule.userAcceptTc(options.documentLink, options.documentHash);
    return this.client.patchExtrinsic<void>(extrinsic);
  }
}

export { TermsAndConditions };
