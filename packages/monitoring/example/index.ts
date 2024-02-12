import { GraphQLMonitor, GridProxyMonitor, RMBMonitor, ServiceMonitor, TFChainMonitor } from "../src/";
async function HealthCheck() {
  try {
    const services = [
      new GridProxyMonitor("<FakeURL>"),
      new GraphQLMonitor("https://graphql.dev.grid.tf/graphql"),
      new TFChainMonitor("wss://tfchain.dev.grid.tf/ws"),
      new RMBMonitor("wss://relay.dev.grid.tf", "wss://tfchain.dev.grid.tf/ws", "mnemonic", "sr25519"),
    ];
    const serviceMonitor = new ServiceMonitor(services);

    // ping some services to check their liveness
    // await serviceMonitor.pingService();

    // keep monitoring services with Interval
    serviceMonitor.interval = 0.25;
    const monitor = serviceMonitor.monitorService();
    await new Promise(resolve => setTimeout(resolve, 0.5 * 60 * 1000));
    await monitor.exitAndDisconnect();
    process.exit(0);
  } catch (err) {
    console.log(err);
  }
}

HealthCheck();
