import {
  GraphQLMonitor,
  GridProxyMonitor,
  RMBMonitor,
  ServiceUrlManager,
  TFChainMonitor,
  URLManagerOptions,
} from "../src";

const gridproxy = ["https://gridproxy.dev.grid.tf/"];
const rmb = ["https://graphql.dev.grid.tf", "wss://relay.dev.grid.tf", "wss://relay.02.dev.grid.tf"];
const graphql = ["https://graphql.dev.grid.tf/graphql"];
const tfChain = ["wss://tfchain.dev.grid.tf/ws"];

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
  silent: true,
  services: [
    { service: new GridProxyMonitor(), URLs: gridproxy },
    { service: new GraphQLMonitor(), URLs: graphql },
    {
      service: new RMBMonitor(),
      URLs: rmb,
    },
    { service: new TFChainMonitor(), URLs: tfChain },
  ],
  timeout: 2,
});
