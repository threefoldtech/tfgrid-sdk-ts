import { TermsAndConditions } from "@threefold/tfchain_client";
import axios from "axios";
import { default as md5 } from "crypto-js/md5";

export interface AcceptOptions {
  documentLink: string;
}

class TFTermsAndConditions extends TermsAndConditions {
  async accept(options: AcceptOptions) {
    const document = await axios.get(options.documentLink);
    const documentHash = md5(document.data).toString();
    return await super.accept({ documentHash, documentLink: options.documentLink });
  }
}

export { TFTermsAndConditions };
