import { HTTPMessageBusClient } from "ts-rmb-http-client";
async function main() {
    const dstNodeId = 10;
    async function deploy() {
        try {
            const rmb = new HTTPMessageBusClient(26, "http://localhost:8080", "http://localhost:8080", "miss secret news run cliff lens exist clerk lucky cube fall soldier");
            const msg = rmb.prepare("zos.statistics.get", [dstNodeId], 0, 2);
            const retMsg = await rmb.send(msg, "{'test':'test'}");
            const result = await rmb.read(retMsg);
            console.log(`the read response is:`);
            console.log(result);
        } catch (err) {
            // fails at node/httpClient.js:142 when signing
            // or cannot verify signature at node/httpClient.js:167 when provided mnemonics
            console.log(err);
        }
    }
    deploy();
}
main();
