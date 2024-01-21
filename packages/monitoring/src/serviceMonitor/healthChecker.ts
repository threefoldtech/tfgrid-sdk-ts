import { IServiceMonitor, TFServices } from "src/types";

import { GraphQlMonitor } from "./graphql";
import { GridProxyMonitor } from "./gridproxy";
import { RMBMonitor } from "./rmb";
import { TFChainMonitor } from "./tfChain";

type ServiceStatus = Record<string, "Alive" | "Down">;

const HEALTH_CHECK_INTERVAL = 5000;
const MAX_RETRIES = 2;

export async function TFServicesLiveMonitor(services: TFServices, interval = HEALTH_CHECK_INTERVAL): Promise<void> {
  const serviceArray: IServiceMonitor[] = initializeServices(services);

  // eslint-disable-next-line no-constant-condition
  // making sure we have at least one service to monitor
  while (serviceArray.length) {
    for (const service of serviceArray) {
      await liveChecker(service);
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

export function initializeServices(services: TFServices): IServiceMonitor[] {
  const serviceArray: IServiceMonitor[] = [];

  for (const serviceName in services) {
    switch (serviceName) {
      case "graphQL":
        serviceArray.push(new GraphQlMonitor(services.graphQL.LivenessURL));
        break;
      case "gridProxy":
        serviceArray.push(new GridProxyMonitor(services.gridProxy.LivenessURL));
        break;
      case "tfChain":
        serviceArray.push(new TFChainMonitor(services.tfChain.LivenessURL));
        break;
      case "rmb":
        serviceArray.push(new RMBMonitor(services.rmb.LivenessURL, services?.tfChain.LivenessURL, "sr25519"));
        break;
      default:
        console.warn(`Unknown service: ${serviceName}`);
        break;
    }
  }

  return serviceArray;
}

async function liveChecker(liveChecker: IServiceMonitor, retries = MAX_RETRIES): Promise<ServiceStatus> {
  let alive = false;
  while (!alive && retries > 0) {
    alive = await liveChecker.LiveChecker();
    retries--;
  }
  return { [liveChecker.ServiceName]: alive ? "Alive" : "Down" };
}
