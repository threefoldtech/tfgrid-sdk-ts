import axios from "axios";
import { default as md5 } from "crypto-js/md5";

import { TFClient } from "./client";

class TermsAndConditions {
    tfclient: TFClient;

    constructor(client: TFClient) {
        this.tfclient = client;
    }

    async acceptTermsAndConditions(documentLink: string) {
        const document = await axios.get(documentLink);
        const documentHash = md5(document.data);
        return await this.tfclient.applyExtrinsic(
            this.tfclient.client.acceptTermsAndConditions,
            [documentLink, documentHash],
            "system",
            ["ExtrinsicSuccess"],
        );
    }
}

export { TermsAndConditions };
