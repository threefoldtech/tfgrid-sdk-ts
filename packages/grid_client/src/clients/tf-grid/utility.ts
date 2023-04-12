import { ISubmittableResult } from "@polkadot/types/types";

import { TFClient } from "./client";

class Utility {
    tfclient: TFClient;

    constructor(client: TFClient) {
        this.tfclient = client;
    }

    async batch(extrinsics: ISubmittableResult[]) {
        if (extrinsics.length > 0) {
            return await this.tfclient.applyExtrinsic(this.tfclient.client.batch, [extrinsics], "utility", [
                "BatchCompleted",
            ]);
        }
    }
    async batchAll(extrinsics: ISubmittableResult[]) {
        if (extrinsics.length > 0) {
            return await this.tfclient.applyExtrinsic(this.tfclient.client.batchAll, [extrinsics], "utility", [
                "BatchCompleted",
            ]);
        }
    }
}

export { Utility };
