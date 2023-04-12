import { TFKVStore } from "./src/storage/tfkvstore";
import { KeypairType } from "./src/clients/tf-grid/client";
import { FS } from "./src/storage/filesystem";


async function test() {
    const kv = new TFKVStore(
        "wss://tfchain.dev.grid.tf/ws",
        "miss secret news run cliff lens exist clerk lucky cube fall soldier",
        "secret",
        KeypairType.sr25519
    );
    await kv.client.connect();
    const x = "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";
    await kv.set("hamada.json", x);
    const y = await kv.get("hamada.json");
    console.log(y);
    console.log(await kv.client.kvStore.list());
    console.log(x === y);

    kv.client.disconnect();

}


async function test2() {
    const fs = new FS();
    await fs.set("/home/ahmed/.config/grid3_client/dev/56/machines/newVMS1/contracts.json", "");
}


test2();
