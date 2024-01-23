import { events } from "../helpers/events";
import { RMBMonitor, TFChainMonitor } from "../index";
import { IServiceAliveness } from "../types";
export async function disconnectServices(services: IServiceAliveness[]): Promise<void> {
  for (const service of services) {
    if (service instanceof RMBMonitor || service instanceof TFChainMonitor) {
      events.emit("logs", `Disconnecting ${service.ServiceName}...`);
      await service.disconnect();
    }
  }
}
