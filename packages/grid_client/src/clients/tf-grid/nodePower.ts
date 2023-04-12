import { TFClient } from "./client";

class NodePower {
    tfclient: TFClient;

    constructor(client: TFClient) {
        this.tfclient = client;
    }

    async set(nodeId: number, power: boolean) {
        return await this.tfclient.applyExtrinsic(this.tfclient.client.setNodePower, [nodeId, power], "tfgridModule", [
            "PowerTargetChanged",
        ]);
    }
}

export { NodePower };
