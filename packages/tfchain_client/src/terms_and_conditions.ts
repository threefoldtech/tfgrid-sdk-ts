import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { ISubmittableResult } from "@polkadot/types/types";

import { Client } from "./client";

class TermsAndConditions {
  constructor(public client: Client) {
    this.client = client;
  }

  async acceptExtrinsic(
    documentLink: string,
    documentHash: string,
  ): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    return this.client.checkConnectionAndApply(this.client.api.tx.tfgridModule.userAcceptTc, [
      documentLink,
      documentHash,
    ]);
  }

  async accept(documentLink: string, documentHash: string): Promise<void> {
    const extrinsic = await this.acceptExtrinsic(documentLink, documentHash);
    return this.client.applyExtrinsic<void>(extrinsic);
  }
}

export { TermsAndConditions };
