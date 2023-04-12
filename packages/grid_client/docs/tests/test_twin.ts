import { ApiPromise, WsProvider } from "@polkadot/api";

async function test() {
    const provider = new WsProvider("wss://tfchain.dev.grid.tf/ws");
    const cl = await ApiPromise.create({ provider });
    const twin = (await cl.query.tfgridModule.twins(26)).toJSON();
    console.log(twin);
}

test();
