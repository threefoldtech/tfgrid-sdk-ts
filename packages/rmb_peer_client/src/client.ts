import { createClient, RedisClientType } from "redis";
import uuid4 from "uuid4";

import { IncomingResponse, OutgoingRequest } from "./types";

class MessageBusClient {
    client: RedisClientType;
    constructor(port = 6379) {
        this.client = createClient({
            socket: {
                port: port,
            },
        });
        this.connect();
    }

    async connect() {
        this.client.connect();
    }

    async disconnect() {
        this.client.disconnect();
    }

    async send(
        requestCommand: string,
        requestData: string,
        destinationTwinId: number,
        expirationMinutes: number,
    ): Promise<string> {
        const uuid = uuid4();
        const outgoingRequest: OutgoingRequest = {
            ver: 1,
            ref: uuid,
            cmd: requestCommand,
            exp: expirationMinutes * 60,
            dat: Buffer.from(requestData).toString("base64"),
            tag: "",
            dst: [destinationTwinId],
            ret: uuid,
            shm: "application/json",
            now: Math.floor(new Date().getTime() / 1000),
        };

        const request = JSON.stringify(outgoingRequest);
        await this.client.lPush("msgbus.system.local", request);
        return outgoingRequest.ref;
    }

    async read(requestId: string, timeoutMinutes = 1): Promise<unknown> {
        const res = await this.client.blPop(requestId, timeoutMinutes * 60);

        if (res) {
            const incomingResponse: IncomingResponse = JSON.parse(res.element);
            if (incomingResponse.err) {
                throw Error(`Failed to read response due to: ${incomingResponse.err.message}`);
            }
            const data = Buffer.from(incomingResponse.dat, "base64").toString("ascii");
            return JSON.parse(data);
        }
        throw Error(`Couldn't get the response in ${timeoutMinutes} minutes`);
    }
}

export { MessageBusClient };
