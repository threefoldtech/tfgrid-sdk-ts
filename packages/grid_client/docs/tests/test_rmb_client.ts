import { MessageBusClient } from "ts-rmb-redis-client"

async function main() {
    const myTwinId = 26
    const cmd = "twinserver.contracts.listContractsByTwinId"
    const payload = JSON.stringify({ twinId: 26 })
    const rmb = new MessageBusClient();
    const requestId = await rmb.send(cmd, payload, myTwinId, 1);
    const result = await rmb.read(requestId, 1);
    console.log(result)
    rmb.disconnect()
}
main()
