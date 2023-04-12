import { getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
    const grid3 = await getClient();
    const nodeId = 7;
    const contractId = 2766;
    try {
        log(await grid3.zos.pingNode({ nodeId }));
    } catch (e) {
        log(`Couldn't ping node ${nodeId} due to ${e}`);
    }
    try {
        log(await grid3.zos.getDeployment({ contractId }));
    } catch (e) {
        log(`Couldn't get deployment with contractId ${contractId} due to ${e}`);
    }
    try {
        log(await grid3.zos.hasPublicIPv6({ nodeId }));
    } catch (e) {
        log(`Couldn't reach node ${nodeId} to check if it has public IPV6 due to ${e}`);
    }

    try {
        log(await grid3.zos.listNetworkInterfaces({ nodeId }));
    } catch (e) {
        log(`Couldn't reach node ${nodeId} to list network interfaces due to ${e}`);
    }

    try {
        log(await grid3.zos.listNetworkPublicIPs({ nodeId }));
    } catch (e) {
        log(`Couldn't reach node ${nodeId} to list network pubic IPs due to ${e}`);
    }
    try {
        log(await grid3.zos.getNetworkPublicConfig({ nodeId }));
    } catch (e) {
        log(`Couldn't reach node ${nodeId} to get network public config due to ${e}`);
    }
    try {
        log(await grid3.zos.getStoragePools({ nodeId }));
    } catch (e) {
        log(`Couldn't reach node ${nodeId} to get storage pools due to ${e}`);
    }
    await grid3.disconnect();
}

main();
