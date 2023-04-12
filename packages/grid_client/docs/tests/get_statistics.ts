import { HTTPMessageBusClient } from "ts-rmb-http-client";
import { MessageBusClient } from "ts-rmb-redis-client"

async function main() {
    const myTwin = 1061;
    const node_twin_id = 11;
    const cmd = "zos.statistics.get";
    const payload = JSON.stringify({});
    // let rmb = new HTTPMessageBusClient(myTwin, "https://gridproxy.grid.tf", "", "miss secret news run cliff lens exist clerk lucky cube fall soldier");
    let rmb = new MessageBusClient()
    let msg = rmb.prepare(cmd, [node_twin_id], 0, 2);
    await rmb.send(msg, payload);
    const result = await rmb.read(msg);
    console.log(result);
}
main();
