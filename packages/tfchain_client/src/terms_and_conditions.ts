import { Client } from "./client";

export interface AcceptOptions {
  documentLink: string;
  documentHash: string;
}

class TermsAndConditions {
  constructor(public client: Client) {
    this.client = client;
  }

  async accept(options: AcceptOptions) {
    const extrinsic = await this.client.checkConnectionAndApply(this.client.api.tx.tfgridModule.userAcceptTc, [
      options.documentLink,
      options.documentHash,
    ]);
    return this.client.patchExtrinsic<void>(extrinsic);
  }
}

export { TermsAndConditions };
