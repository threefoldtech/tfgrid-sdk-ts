import { createClient, RedisClientType } from "redis";

import { IncomingRequest, OutgoingResponse } from "./types";

class MessageBusServer {
    client: RedisClientType;
    handlers: any;
    constructor(port: number) {
        this.client = createClient({
            socket: {
                port: port,
            },
        });
        this.client.connect();
        this.client.on("error", function (error) {
            console.error(error);
        });

        this.handlers = new Map();
    }

    withHandler(topic: string, handler: { message: IncomingRequest; payload: string }): void {
        this.handlers.set(`msgbus.${topic}`, handler);
    }

    async run(): Promise<void> {
        console.log("[+] waiting for request");

        const channels: string[] = Array.from(this.handlers.keys());
        channels.forEach(ch => {
            console.log(`[+] watching ${ch}`);
        });

        const result = await this.client.blPop(channels, 0);
        if (result) {
            const { key, element } = result;

            if (!this.handlers.has(key)) {
                console.log(`handler ${key} is not initialized, skipping`);
                return;
            }

            const parsedRequest = JSON.parse(element);
            const payload = Buffer.from(parsedRequest.dat, "base64").toString("ascii");

            const handler = this.handlers.get(key);

            try {
                const data = await handler(parsedRequest, payload);
                console.log(`data from handler: ${data}`);
                await this.reply(parsedRequest, data);
            } catch (error) {
                await this.error(parsedRequest, error as string);
            }
        }

        this.run();
    }

    async reply(message: IncomingRequest, payload: string): Promise<void> {
        const replyMessage: OutgoingResponse = {
            dat: Buffer.from(JSON.stringify(payload)).toString("base64"),
            dst: message.src,
            now: Math.floor(new Date().getTime() / 1000),
            ref: message.ref,
            shm: message.shm,
            ver: message.ver,
            err: null,
        };
        await this.client.lPush(message.ret, JSON.stringify(replyMessage));
    }

    async error(message: IncomingRequest, reason: string): Promise<void> {
        console.log("[-] replying error: " + reason);

        const replyMessage: OutgoingResponse = {
            dat: "",
            dst: message.src,
            now: Math.floor(new Date().getTime() / 1000),
            ref: message.ref,
            shm: message.shm,
            ver: message.ver,
            err: { message: String(reason), code: 500 },
        };
        await this.client.lPush(message.ret, JSON.stringify(replyMessage));
    }
}

export { MessageBusServer };
