import { Client as RMBClient } from "@threefold/rmb_direct_client";

class RMB {
    client: RMBClient;
    constructor(rmbClient: RMBClient) {
        this.client = rmbClient;
    }

    async request(destTwinIds: number[], cmd: string, payload: string, expiration = 60, retires = 1) {
        let result;
        try {
            const requestId = await this.client.send(cmd, payload, destTwinIds[0], expiration / 60);
            result = await this.client.read(requestId);
        } catch (e) {
            throw Error(
                `Failed to send request to twinId ${destTwinIds} with command: ${cmd}, payload: ${payload} due to ${e}`,
            );
        }
        return result;
    }
}

export { RMB };
