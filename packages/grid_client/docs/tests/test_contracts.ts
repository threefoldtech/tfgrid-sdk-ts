import "reflect-metadata";

import { TFClient } from "../src/clients/tf-grid";
import { CapacityReservationPolicy } from "../src/clients/tf-grid/contracts";
import { KeypairType } from "../src/zos/deployment";
import { log } from "./utils";

async function main() {
    const cl = new TFClient(
        "ws://127.0.0.1:9944/ws",
        "miss secret news run cliff lens exist clerk lucky cube fall soldier",
        "hamada",
        KeypairType.sr25519,
    );
    await cl.connect();
    const c: CapacityReservationPolicy = {
        exclusive: {
            groupId: 4,
            resources: {
                cru: 1,
                hru: 1,
                mru: 1,
                sru: 1,
            },
            features: [
                {
                    publicNode: true,
                },
            ],
        },
    };

    const s: CapacityReservationPolicy = {
        node: { nodeId: 1 },
    };

    // console.log(await cl.contracts.createDeployment(16, "87ac2a56b7c88bbab1a2c43a3bbec46d", "", {cru:1, mru:1, hru:0, sru:1}, 0))
    // console.log(await cl.contracts.getDeployment(1))
    // console.log(await cl.contracts.cancelDeployment(2));

    // log(await cl.contracts.get(10))
    // console.log(await cl.contracts.createCapacityReservation(1, s, undefined));
    // console.log(await cl.contracts.updateCapacityReservation(12, {cru:10, hru:0, sru:0, mru:0} ))
    // console.log(await cl.contracts.get(4))
    // console.log(await cl.contracts.createName("hamada1"))
    // console.log(await cl.contracts.cancel(16));

    // console.log(await cl.groups.delete(5))
    console.log(await cl.contracts.activeNodeContracts(1));

    cl.disconnect();
}
main();
