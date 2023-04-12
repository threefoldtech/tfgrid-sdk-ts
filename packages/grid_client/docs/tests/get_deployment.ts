import { HTTPMessageBusClient } from "ts-rmb-http-client";

async function main() {
    const myTwin = 26;
    const node_twin_id = 16;
    const cmd = "zos.deployment.get";
    const payload = JSON.stringify({ contract_id: 340 });
    let rmb = new HTTPMessageBusClient(myTwin, "https://gridproxy.test.grid.tf", "", "action good large fortune flight hero reveal artist drum hole one play");
    let msg = rmb.prepare(cmd, [node_twin_id], 0, 2);
    await rmb.send(msg, payload);
    const result = await rmb.read(msg);
    console.log(result);
}
main();
