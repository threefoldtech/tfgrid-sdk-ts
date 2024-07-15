const gridproxy = ["test", "hello", "https://gridproxy.dev.grid.tf/"];
const rmb = ["wsefews://tfin.dev.grid.tf/ws", "wss://relay.dev.grid.tf"];
const graphql = ["https://graphql.dev.grid.tf/graphql"];
const tfChain = ["wss://tfchain.dev.grid.tf/ws", "wsss://tfchain.dev.grid.tf/ws"];
const mnemonic = "<MNEMONIC>";

import { ServiceUrlManager, StackPickerOptions } from "../src";

async function checkStacksAvailability(services: StackPickerOptions) {
  try {
    const pickedUrls = await new ServiceUrlManager(services).getAvailableServices();
    await Promise.all(Object.values(pickedUrls));
    console.log(pickedUrls);
    process.exit(0);
  } catch (err) {
    console.log(err);
  }
}

checkStacksAvailability({
  tfChain,
  rmb,
  graphql,
  gridproxy,
  mnemonic,
});
