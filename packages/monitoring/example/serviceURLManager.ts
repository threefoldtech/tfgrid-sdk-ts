import {
  GraphQLMonitor,
  GridProxyMonitor,
  RMBMonitor,
  ServiceUrlManager,
  TFChainMonitor,
  URLManagerOptions,
} from "../src";

const gridproxy = ["http://www.nonexistentgridProxy.com", "http://www.gooogleTF.com", "https://gridproxy.dev.grid.tf/"];
const rmb = ["wss://www.nonExistentRelay.com", "wss://relay.dev.grid.tf"];
const graphql = ["https://graphql.dev.grid.tf/graphql"];
const tfChain = ["wss://tfchain.dev.grid.tf/ws", "wss://www.nonExistentChain.com"];
const mnemonics = "<MNEMONIC>";

async function checkStacksAvailability<N extends boolean>(services: URLManagerOptions<N>) {
  try {
    const pickedUrls = await new ServiceUrlManager(services).getAvailableServicesStack();
    console.log(pickedUrls);
    process.exit(0);
  } catch (err) {
    console.log(err);
  }
}

checkStacksAvailability({
  retries: 3,
  silent: false,
  services: [
    { service: new GridProxyMonitor(), URLs: gridproxy },
    { service: new GraphQLMonitor(), URLs: graphql },
    {
      service: new RMBMonitor({ mnemonics, chainUrl: "wss://tfchain.02.dev.grid.tf/ws", keypairType: "sr25519" }),
      URLs: rmb,
    },
    { service: new TFChainMonitor(), URLs: tfChain },
  ],
});
