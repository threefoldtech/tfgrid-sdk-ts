import { monitorEvents } from "../helpers/events";
import { ILivenessChecker } from "../types";

/**
 * Represents a service monitor that periodically checks the liveness of multiple services.
 */
export class ServiceMonitor {
  /**
   * Creates an instance of ServiceMonitor.
   * @param services - An array of services to monitor.
   * @param interval - The interval, in minutes, between monitoring checks (default is 2 minutes).
   * @param retries - The number of retries in case a service is determined to be down (default is 2 retries).
   * @param retryInterval - The interval, in seconds, between retries (default is 2 seconds).
   */
  constructor(public services: ILivenessChecker[], public interval = 2, public retries = 2, public retryInterval = 2) {}

  /**
   * Checks the liveness of each service once and logs events accordingly.
   * @private
   */
  private async checkLivenessOnce(): Promise<void> {
    for (const service of this.services) {
      for (let retryCount = 1; retryCount <= this.retries; retryCount++) {
        const { alive, error } = await service.isAlive();
        if (alive) {
          monitorEvents.storeStatus(service.name, alive);
          break;
        }
        if (retryCount < this.retries) {
          monitorEvents.log(`${service.name} seems to be down; Retrying (${retryCount}/${this.retries})...`);
          await new Promise(resolve => setTimeout(resolve, this.retryInterval * 60));
        } else monitorEvents.serviceDown(service.name, error);
      }
    }
    monitorEvents.summarize();
  }

  /**
   * Monitors the services at a regular interval and returns a function to exit the monitoring.
   * @returns An object with a function `exit` to stop the monitoring services.
   */
  public monitorService(): { exit: () => Promise<void> } {
    if (this.services.length === 0) throw new Error("No services to monitor");

    monitorEvents.log(`Checking services status...`);
    this.checkLivenessOnce();
    const intervalId = setInterval(async () => await this.checkLivenessOnce(), this.interval * 60 * 1000);

    /**
     * Stops the monitoring services.
     * @returns A promise that resolves when the monitoring is stopped.
     */
    const exit = async (): Promise<void> => {
      clearInterval(intervalId);
    };
    return { exit };
  }

  /**
   * Checks the liveness of each service once.
   */
  public async pingService(): Promise<void> {
    await this.checkLivenessOnce();
  }
}
