import { IServiceAliveness } from "src/types";

const HEALTH_CHECK_INTERVAL = 5000; // ms
const MAX_RETRIES = 2;

export async function monitorServiceAliveness(
  services: IServiceAliveness[],
  interval = HEALTH_CHECK_INTERVAL,
): Promise<void> {
  // making sure we have at least one service to monitor
  while (services.length) {
    for (const service of services) {
      await checkServiceAliveness(service);
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

async function checkServiceAliveness(service: IServiceAliveness, retries = MAX_RETRIES, retryInterval = 1000) {
  while (retries > 0) {
    if (await service.isAlive()) return;
    retries--;
    if (retries > 0) await new Promise(resolve => setTimeout(resolve, retryInterval));
    //else emit event
  }
}
