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

import { ClientOptions, NetworkEnv } from "./config";

enum MapServiceNames {
  proxyURL = "GridProxy",
  relayURL = "RMB",
  substrateURL = "TFChain",
  activationURL = "Activation",
  graphqlURL = "GraphQl",
}
type serviceURLs = {
  proxyURL: string;
  relayURL: string;
  substrateURL: string;
  graphqlURL: string;
  activationURL: string;
};
/**
 * Retrieves a list of services that do not have associated URLs.
 *
 * @param {Object.<string, string | undefined>} urls - An object of services urls.
 * @returns {string[]} An array of service names without URLs.
 */
function getServicesWithoutURLs(urls: { [key: string]: string | undefined }) {
  return Object.entries(urls).reduce((acc, [service, url]) => {
    if (!url) {
      acc.push(service);
    }
    return acc;
  }, [] as string[]);
}

/**
 * Prepares a service object based on the provided name and URLs.
 *
 * This function takes a service name and an array of URLs, then returns a
 * service object containing the URLs and an instantiated service monitor
 * based on the service name. If the service name is not recognized, it throws
 * a GridClientError.
 *
 * @param {string} name - The name of the service.
 * @param {string[]} URLs - An array of URLs associated with the service.
 * @returns {Service} An object containing the URLs and the instantiated service monitor.
 * @throws {GridClientError} If the service name is not recognized.
 */
function prepareServices(name: string, URLs: string[]): Service {
  switch (name) {
    case "proxyURL":
      return { URLs, service: new GridProxyMonitor() };
    case "relayURL":
      return { URLs, service: new RMBMonitor() };
    case "substrateURL":
      return { URLs, service: new TFChainMonitor() };
    case "graphqlURL":
      return { URLs, service: new GraphQLMonitor() };
    case "activationURL":
      return { URLs, service: new ActivationMonitor() };
    default:
      throw new GridClientError(`Can't resolve service with name "${name}"`);
  }
}

/**
 * Maps the result object to a new object based on the provided service names.
 *
 * This function takes a result object and an array of service names. It returns
 * a new object where the keys are the provided service names and the values are taken from
 * the result object, using a mapping from `MapServiceNames`.
 *
 * @param {Object.<string, string | null>} result - The result object to map from.
 * @param {string[]} services - An array of service names to map.
 * @returns {Object.<string, string | null>} A new object with the mapped service names and values.
 */
function mapResult(result: { [key: string]: string | null }, services: string[]) {
  return services.reduce((acc, service) => {
    acc[service] = result[MapServiceNames[service]];
    return acc;
  }, {});
}

/**
 * Retrieves and assigns available URLs for services missing URLs in the client options.
 *
 * This function checks which service URLs are missing in the provided client options,
 * prepares the services with predefined URLs, and uses a `ServiceUrlManager` to
 * retrieve available service URLs.
 *
 * @param {ClientOptions} clientOptions - The client options containing service URLs and network environment.
 * @returns {Promise<serviceURLs>} A promise that resolves to an object containing the updated service URLs.
 */
export async function getAvailableURLs(clientOptions: ClientOptions) {
  const { proxyURL, relayURL, substrateURL, graphqlURL, activationURL, network } = clientOptions;
  const currentURLs = { proxyURL, relayURL, substrateURL, graphqlURL, activationURL };
  const base = network === NetworkEnv.main ? "grid.tf" : `${network}.grid.tf`;
  const URLS = {
    relayURL: [`wss://relay.${base}`, `wss://relay.02.${base}`],
    proxyURL: [`https://gridproxy.${base}`, `https://gridproxy.02.${base}`],
    activationURL: [
      `https://activation.${base}/activation/activate`,
      `https://activation.02.${base}/activation/activate`,
    ],
    graphqlURL: [`https://graphql.${base}/graphql`, `https://graphql.02.${base}/graphql`],
    substrateURL: [`wss://tfchain.${base}/ws`, `wss://tfchain.02.${base}/ws`],
  };
  const missingServicesURLS = getServicesWithoutURLs(currentURLs);

  if (missingServicesURLS.length == 0) return currentURLs as serviceURLs;

  const services = missingServicesURLS.reduce((acc, servicesName) => {
    acc.push(prepareServices(servicesName, URLS[servicesName]));
    return acc;
  }, [] as Service[]);
  const result = await new ServiceUrlManager({
    services: services,
  }).getAvailableServicesStack();
  return Object.assign(currentURLs, mapResult(result, missingServicesURLS)) as serviceURLs;
}
