import { ApiPromise, WsProvider } from "@polkadot/api";

async function test() {
    const provider = new WsProvider("wss://tfchain.dev.grid.tf/ws");
    const cl = await ApiPromise.create({ provider });
    const contract = (await cl.query.smartContractModule.solutionProviders(1)).toJSON();
    if (contract && contract["approved"]) {
        await cl.disconnect();
        return true;
    }
}

test();
