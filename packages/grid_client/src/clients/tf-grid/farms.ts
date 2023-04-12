import { FarmInfo } from "../..";
import { TFClient } from "./client";

class Farms {
    tfclient: TFClient;

    constructor(client: TFClient) {
        this.tfclient = client;
    }

    async getFarmByID(id: number): Promise<FarmInfo> {
        return this.tfclient.queryChain(this.tfclient.client.getFarmByID, [id]);
    }
}

export { Farms };
