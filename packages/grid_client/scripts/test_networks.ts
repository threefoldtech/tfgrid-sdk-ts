import { getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
    const grid3 = await getClient();
    try {
        const networks = await grid3.networks.list();
        log(networks);

        // to have value returned from this method,
        // a machine or k8s should be deployed with 'addAccess' enabled in the network object.
        const config = await grid3.networks.getWireGuardConfigs({ name: "test" });
        log(config);
    } finally {
        grid3.disconnect();
    }
}
main();
