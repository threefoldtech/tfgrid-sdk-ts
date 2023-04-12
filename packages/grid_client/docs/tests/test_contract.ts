import { getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
    const grid3 = await getClient();
    const contract = await grid3.contracts.createCapacityReservation({
        farmId: 1,
        policy: {
            any: {
                resources: {
                    cru: 1,
                    mru: 2,
                    sru: 3,
                    hru: 4,
                },
            },
        },
    });

    log(contract);
    log(await grid3.contracts.get({ id: contract.contractId }));
    const deploymentContract = await grid3.contracts.createDeployment({
        capacityReservationId: contract.contractId,
        data: "test",
        hash: "87ac2a56b7c88bbab1a2c43a3bbec46d",
        resources: {
            cru: 1,
            mru: 1,
            sru: 1,
            hru: 1,
        },
        publicIps: 0,
    });
    log(deploymentContract);
    log(await grid3.contracts.getDeployment({ id: deploymentContract.id }));

    const contractUpdate = await grid3.contracts.updateCapacityReservation({
        capacityReservationId: contract.contractId,
        resources: {
            cru: 5,
            mru: 6,
            sru: 7,
            hru: 8,
        },
    });
    log(contractUpdate);
    log(await grid3.contracts.get({ id: contract.contractId }));

    const deploymentContractUpdate = await grid3.contracts.updateDeployment({
        id: deploymentContract.id,
        data: "test 123",
        hash: "87ac2a56b7c88bbab1a2c43a3bbec46d",
        resources: {
            cru: 2,
            mru: 2,
            sru: 2,
            hru: 2,
        },
    });
    log(deploymentContractUpdate);
    log(await grid3.contracts.getDeployment({ id: deploymentContract.id }));

    log(await grid3.contracts.get({ id: contract.contractId }));

    log(await grid3.contracts.cancelDeployment({ id: deploymentContract.id }));

    log(await grid3.contracts.cancel({ id: contract.contractId }));
    await grid3.disconnect();
}

main();
