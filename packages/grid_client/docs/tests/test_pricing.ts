import { TFClient } from "../src/";
async function main() {
    const cl = new TFClient(
        "wss://tfchain.dev.grid.tf/ws",
        "miss secret news run cliff lens exist clerk lucky cube fall soldier",
        "hamada",
    );
    await cl.connect();
    console.log(await cl.pricingPolcy.getPricingPolicyById(1));
    await cl.disconnect();
}
main();
