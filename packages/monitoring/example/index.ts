import { checkServiceAliveness, disconnectServices, GridProxyMonitor, monitorServiceAliveness } from "../src/";
import { RMBMonitor, TFChainMonitor } from "../src/serviceMonitor";
import { IServiceAliveness } from "../src/types";
async function HealthCheck() {
  try {
    const services: IServiceAliveness[] = [];
    services.push(new GridProxyMonitor("<FakeURL>"));
    services.push(
      new TFChainMonitor(
        "wss://tfhain.dev.grid.tf/ws",
        "energy garage female trend guard pipe skill dumb drill defy crush genuine",
        "sr25519",
      ),
    );
    services.push(
      new RMBMonitor(
        "wss://relay.dev.grid.tf",
        "wss://tfchain.dev.grid.tf/ws",
        "energy garage female trend guard pipe skill dumb drill defy crush genuine",
        "sr25519",
      ),
    );
    // monitor some services once
    await checkServiceAliveness(services);
    // keep monitoring services with Interval
    await monitorServiceAliveness(services, 5);
    await disconnectServices(services);
    process.exit(0);
  } catch (err) {
    console.log(err);
  }
}

HealthCheck();
