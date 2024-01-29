import { events } from "../helpers/events";
import { ILivenessChecker } from "../types";
import { disconnectServices } from "./disconnectHandler";

/**
 * Monitors the aliveness of one or multiple services at a specified interval.
 *
 * @param services - An array of services implementing the IServiceAliveness interface to be monitored.
 * @param interval - The interval, in minutes, at which the services' aliveness will be checked. Defaults to 2 minutes.
 *
 * @throws Will throw an error if the provided services array is empty.
 *
 * @returns An object with a method `exitAndDisconnect` that can be used to stop the monitoring and disconnect services.
 *
 */
export function monitorServiceAliveness(
  services: IServiceAliveness[],
  interval = 2,
): { exitAndDisconnect: () => Promise<void> } {
  if (!services.length) throw new Error("No services to monitor");

  events.emit("logs", `Checking services status...`);
  checkServiceAliveness(services);
  const intervalId = setInterval(async () => await checkServiceAliveness(services), interval * 60 * 1000);

  const exitAndDisconnect = async () => {
    clearInterval(intervalId);
    await disconnectServices(services);
  };
  return { exitAndDisconnect };
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
      if (alive) {
        events.emit("storeServiceStatus", service.ServiceName, alive);
        break;
      }
      if (retryCount < retries) {
        events.emit("logs", `${service.ServiceName} seems to be down; Retrying (${retryCount}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, retryInterval * 60));
      } else events.emit("serviceIsDown", service.ServiceName, error);
    }
  }
  events.emit("summarize");
}
