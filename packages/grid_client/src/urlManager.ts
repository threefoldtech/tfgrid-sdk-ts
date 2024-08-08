import {
  ActivationMonitor,
  GraphQLMonitor,
  GridProxyMonitor,
  RMBMonitor,
  Service,
  ServiceUrlManager,
  TFChainMonitor,
} from "@threefold/monitoring";
import { GridClientError } from "@threefold/types";

import { NetworkEnv } from "./config";

enum MapServiceNames {
  rmbProxy = "GridProxy",
  relay = "RMB",
  substrate = "TFChain",
  activation = "Activation",
  graphql = "GraphQl",
}

function prepareServices(name: string, URLs: string[]): Service {
  switch (name) {
    case "rmbProxy":
      return { URLs, service: new GridProxyMonitor() };
    case "relay":
      return { URLs, service: new RMBMonitor() };
    case "substrate":
      return { URLs, service: new TFChainMonitor() };
    case "graphql":
      return { URLs, service: new GraphQLMonitor() };
    case "activation":
      return { URLs, service: new ActivationMonitor() };
    default:
      throw new GridClientError(`Can't resolve service with name "${name}"`);
  }
}

function mapResult(result: { [key: string]: string | null }, services: string[]) {
  return services.reduce((acc, service) => {
    acc[service] = result[MapServiceNames[service]];
    return acc;
  }, {});
}
export async function availableURLS(_services: string[], network: NetworkEnv) {
  const base = network === NetworkEnv.main ? "grid.tf" : `${network}.grid.tf`;
  const URLS = {
    relay: [`wss://relay.${base}`, `wss://relay.02.${base}`],
    rmbProxy: [`https://gridproxy.${base}`, `https://gridproxy.02.${base}`],
    activation: [`https://activation.${base}/activation/activate`, `https://activation.02.${base}/activation/activate`],
    graphql: [`https://graphql.${base}/graphql`, `https://graphql.02.${base}/graphql`],
    substrate: [`wss://tfchain.${base}/ws`, `wss://tfchain.02.${base}/ws`],
  };
  const services = _services.reduce((acc, servicesName) => {
    acc.push(prepareServices(servicesName, URLS[servicesName]));
    return acc;
  }, [] as Service[]);

  const result = await new ServiceUrlManager({
    services: services,
    silent: true,
  }).getAvailableServicesStack();
  return mapResult(result, _services);
}
