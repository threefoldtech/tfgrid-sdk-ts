import { getClient, getNewClient } from "./client_loader";

async function main() {
    const oldClient = await getClient();
    const newClient = await getNewClient();
    const oldDB = oldClient.kvstore;
    const newDB = newClient.kvstore;

    const oldKeys = await oldClient.kvstore.list();
    let failedCount = 0;
    let alreadyMigratedCount = 0;
    const extrinsics = [];
    for (const oldKey of oldKeys) {
        try {
            const oldValue = await oldDB.get({ key: oldKey });
            const newValue = newDB.client.kvStore.encrypt(oldValue);
            extrinsics.push(newDB.client.client.api.tx.tfkvStore.set(oldKey, newValue));
        } catch {
            try {
                await newDB.get({ key: oldKey });
                alreadyMigratedCount++;
                console.log(`${oldKey} key is migrated`);
            } catch (error) {
                failedCount++;
            }
        }
    }
    if (extrinsics.length > 0) {
        try {
            await newClient.utility.batchAll({ extrinsics });
        } catch (e) {
            throw Error(`All or part of the keys are not migrated due to: ${e}`);
        }
    }
    console.log(
        `Migrated keys: ${extrinsics.length}, already migrated keys: ${alreadyMigratedCount}, failed keys: ${failedCount}`,
    );
    if (failedCount > 0 && extrinsics.length === 0) {
        throw Error("storeSecret is wrong. Please enter the right storeSecret.");
    } else if (failedCount > 0 && extrinsics.length !== 0) {
        throw Error(
            "Part of the keys are migrated successfully, but still some keys are not migrated. Maybe they are encrypted with different password or not encrypted",
        );
    }
    await newClient.disconnect();
    await oldClient.disconnect();
}

main();
