import { events } from "../helpers/events";
import { IServiceAliveness } from "../types";

const HEALTH_CHECK_INTERVAL = 5000; // ms
const MAX_RETRIES = 2;

export async function monitorServiceAliveness(
  services: IServiceAliveness[],
  interval = HEALTH_CHECK_INTERVAL,
): Promise<void> {
  // making sure we have at least one service to monitor
  while (services.length) {
    events.emit("logs", `Checking services status...`);
    await checkServiceAliveness(services);
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

export async function checkServiceAliveness(
  services: IServiceAliveness[],
  retries = MAX_RETRIES,
  retryInterval = 1000,
) {
  for (const service of services) {
    for (let retryCount = 1; retryCount <= retries; retryCount++) {
      const { alive, error } = await service.isAlive();
      if (alive) break;
      if (retryCount < retries) {
        events.emit("logs", `${service.ServiceName} seems to be down; Retrying (${retryCount}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      } else events.emit("serviceIsDown", service.ServiceName, error);
    }
  }
}
