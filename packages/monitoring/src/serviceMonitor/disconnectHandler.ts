import { events } from "../helpers/events";
import { IDisconnectHandler, ILivenessChecker } from "../types";
export async function disconnectServices(services: ILivenessChecker[]): Promise<void> {
  for (const service of services) {
    if ("disconnect" in service) {
      events.emit("logs", `Disconnecting ${service.disconnect}...`);
      await (service as IDisconnectHandler).disconnect();
    }
  }
}
