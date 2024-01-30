import { monitorEvents } from "../helpers/events";
import { IDisconnectHandler, ILivenessChecker } from "../types";

export class ServiceMonitor {
  constructor(public services: ILivenessChecker[], public interval = 2, public retries = 2, public retryInterval = 2) {}

  private async checkLivenessOnce() {
    for (const service of this.services) {
      for (let retryCount = 1; retryCount <= this.retries; retryCount++) {
        const { alive, error } = await service.isAlive();
        if (alive) {
          monitorEvents.storeStatus(service.serviceName(), alive);
          break;
        }
        if (retryCount < this.retries) {
          monitorEvents.log(`${service.serviceName()} seems to be down; Retrying (${retryCount}/${this.retries})...`);
          await new Promise(resolve => setTimeout(resolve, this.retryInterval * 60));
        } else monitorEvents.serviceDown(service.serviceName(), error);
      }
    }
    monitorEvents.summarize();
  }
  public monitorService(): { exitAndDisconnect: () => Promise<void> } {
    if (this.services.length === 0) throw new Error("No services to monitor");

    monitorEvents.log(`Checking services status...`);
    this.checkLivenessOnce();
    const intervalId = setInterval(async () => await this.checkLivenessOnce(), this.interval * 60 * 1000);

    const exitAndDisconnect = async () => {
      clearInterval(intervalId);
      await this.disconnectServices();
    };
    return { exitAndDisconnect };
  }
  public async pingService() {
    await this.checkLivenessOnce();
    await this.disconnectServices();
  }
  public async disconnectServices(): Promise<void> {
    for (const service of this.services) {
      if ("disconnect" in service) {
        await (service as IDisconnectHandler).disconnect();
      }
    }
  }
}
