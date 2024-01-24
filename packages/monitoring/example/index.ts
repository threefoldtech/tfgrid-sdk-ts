import { checkServiceAliveness, disconnectServices, GridProxyMonitor, monitorServiceAliveness } from "../src/";
import { RMBMonitor, TFChainMonitor } from "../src/serviceMonitor";
import { IServiceAliveness } from "../src/types";
async function HealthCheck() {
  try {
    const services: IServiceAliveness[] = [];
    services.push(new GridProxyMonitor("<FakeURL>"));
    services.push(new TFChainMonitor("wss://tfhain.dev.grid.tf/ws", "<MNEMONIC>", "sr25519"));
    services.push(new RMBMonitor("wss://relay.dev.grid.tf", "wss://tfchain.dev.grid.tf/ws", "<MNEMONIC>", "sr25519"));
    // monitor some services once
    await checkServiceAliveness(services);

    // disconnect
    await disconnectServices(services);

    // keep monitoring services with Interval
    const monitor = monitorServiceAliveness(services, 0.25);
    await new Promise(resolve => setTimeout(resolve, 0.5 * 60 * 1000));
    await monitor.exitAndDisconnect();
    process.exit(0);
  } catch (err) {
    console.log(err);
  }
}

HealthCheck();
