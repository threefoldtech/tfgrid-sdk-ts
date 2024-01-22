import { events } from "../helpers/events";
import { IServiceAliveness } from "../types";

/**
 * Monitors the aliveness of one or multiple services at a specified interval.
 *
 * @param services - An array of services to monitor.
 * @param interval - The interval, in minutes, between consecutive checks (default is 2 minutes).
 *
 */
export async function monitorServiceAliveness(services: IServiceAliveness[], interval = 2): Promise<void> {
  // making sure we have at least one service to monitor
  while (services.length) {
    events.emit("logs", `Checking services status...`);
    await checkServiceAliveness(services);
    await new Promise(resolve => setTimeout(resolve, interval * 60 * 1000));
  }
}

/**
 * Checks the aliveness of multiple services with optional retries.
 *
 * @param services - An array of services to check.
 * @param retries - The number of retry attempts for each service (default is 2).
 * @param retryInterval - The interval, in minutes, between consecutive retry attempts (default is 2 minutes).
 * @returns A Promise that resolves when all services are checked.
 */
export async function checkServiceAliveness(services: IServiceAliveness[], retries = 2, retryInterval = 2) {
  for (const service of services) {
    for (let retryCount = 1; retryCount <= retries; retryCount++) {
      const { alive, error } = await service.isAlive();
      if (alive) break;
      if (retryCount < retries) {
        events.emit("logs", `${service.ServiceName} seems to be down; Retrying (${retryCount}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, retryInterval * 60));
      } else events.emit("serviceIsDown", service.ServiceName, error);
    }
  }
}
