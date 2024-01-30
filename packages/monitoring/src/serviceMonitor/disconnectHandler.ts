import { monitorEvents } from "../helpers/events";
import { IDisconnectHandler, ILivenessChecker } from "../types";
export async function disconnectServices(services: ILivenessChecker[]): Promise<void> {
  for (const service of services) {
    if ("disconnect" in service) {
      monitorEvents.log(`Disconnecting ${service.disconnect}...`);
      await (service as IDisconnectHandler).disconnect();
    }
  }
}
