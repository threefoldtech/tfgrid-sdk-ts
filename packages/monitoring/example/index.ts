import { checkServiceAliveness, GridProxyMonitor, monitorServiceAliveness } from "../src/";
import { RMBMonitor, TFChainMonitor } from "../src/serviceMonitor";
import { IServiceAliveness } from "../src/types";
async function HealthCheck() {
  try {
    const services: IServiceAliveness[] = [];
    services.push(new GridProxyMonitor("<FakeURL>"));
    services.push(new TFChainMonitor("wss://tfchain.dev.grid.tf/ws"));
    services.push(new RMBMonitor("wss://relay.dev.grid.tf", "wss://tfchain.dev.grid.tf/ws", "", "sr25519"));
    // monitor some services once
    await checkServiceAliveness(services);
    // keep monitoring services with Interval
    await monitorServiceAliveness(services, 5);

    process.exit(0);
  } catch (err) {
    console.log(err);
  }
}

HealthCheck();
