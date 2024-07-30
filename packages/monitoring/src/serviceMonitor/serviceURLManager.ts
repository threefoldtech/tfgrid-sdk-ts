import { ConnectionError } from "@threefold/types";

import { monitorEvents } from "../helpers/events";
import { IDisconnectHandler, ILivenessChecker, Service, ServiceStatus, ServiceUrl, URLManagerOptions } from "../types";

/**
 * Manages service URLs, checking their availability and ensuring they are reachable.
 *
 * @template N - A boolean type that defaults to false, this got effected by silent value and effects the results type;
 *
 * @constructor
 * @param {URLManagerOptions<N>} [options] - The options for configuring the manager.
 *
 * @property {Service[]} [services] - The list of services to be managed.
 */
export class ServiceUrlManager<N extends boolean = false> {
  public results: { [key: string]: ServiceUrl<N> } = {};
  private retries = 3;
  private silent: N = false as N;
  public services: Service[];
  public timeout = 2;

  constructor(options: URLManagerOptions<N>) {
    Object.assign(this, options);
  }

  /**
   * Pings the given service to check if it is alive.
   *
   * This method checks the liveness of the provided service by calling its `isAlive` method.
   * If the service supports disconnection (implements IDisconnectHandler), it calls the `disconnect` method after the liveness check.
   *
   * @param {ILivenessChecker} service - An instance of ILivenessChecker that provides methods to check the service's liveness.
   * @param {number} _timeout - The timeout duration for the ping request.
   * @param {string} url - The URL of the service to be pinged.
   *
   * @returns {Promise<{alive: boolean, error?: Error}>} - A promise that resolves with the liveness status of the service.
   */
  private async pingService(service: ILivenessChecker, _timeout: number, url: string): Promise<ServiceStatus> {
    try {
      const statusPromise = service.isAlive(url);

      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error("Timeout"));
        }, _timeout * 1000);
      });

      const result = await Promise.race([statusPromise, timeoutPromise]);
      if (result instanceof Error && result.message === "Timeout") {
        throw result;
      }
      if ("disconnect" in service) {
        await (service as IDisconnectHandler).disconnect();
      }
      return result as ServiceStatus;
    } catch (e) {
      return {
        alive: false,
        error: e,
      };
    }
  }

  /**
   * Handles errors based on the silent mode setting.
   *
   * If silent mode is enabled, logs the error message and returns null.
   * If silent mode is disabled, throws an error with the provided message.
   *
   * @private
   * @param {string} errorMsg - The error message to handle.
   * @returns {null} - Returns null if silent mode is enabled, otherwise throws an error.
   * @throws {Error} - Throws an error with the provided message if silent mode is disabled.
   */
  private handleErrorsOnSilentMode(errorMsg: string) {
    if (this.silent) {
      monitorEvents.log(errorMsg, "red");
      return null;
    }
    throw new Error(errorMsg);
  }
  /**
   * Checks if a service is alive with retries.
   *
   * This method attempts to check the availability of a service at a given URL, retrying the check
   * a specified number of times if the service is not reachable. If the service becomes reachable,
   * the URL is returned. Otherwise, an error is thrown after the maximum number of retries.
   *
   * @param {string} url - The URL of the service to check.
   * @param {ILivenessChecker} service - An instance of ILivenessChecker used to check the service's liveness.
   *
   * @returns {Promise<string>} - A promise that resolves with the URL if the service is reachable within the retries.
   *
   * @throws {ConnectionError} - Throws an error if the service cannot be reached after the maximum number of retries.
   */
  async isAliveWithRetries(url: string, service: ILivenessChecker): Promise<string> {
    for (let retry = 0; retry < this.retries; retry++) {
      const status = await this.pingService(service, this.timeout + retry * this.timeout, url);
      if (status?.alive) {
        monitorEvents.log(`${service.name} on ${url} Success!`, "green");
        return url;
      }
      if (status?.error) monitorEvents.log(`${service.name}: ${url} ${status.error}`, "gray");
    }
    throw new ConnectionError(`${service.name}: Can't reach ${url} after 3 retries`);
  }

  /**
   * Attempts to find a reachable service URL from a list of provided URLs.
   *
   * This method iterates through the list of URLs, repeatedly pinging the service to
   * check if it is alive. If a reachable URL is found, it is returned. If all URLs
   * are exhausted without finding a reachable service, an error is thrown.
   *
   * @param {string[]} urls - An array of service URLs to check for reachability.
   * @param {ILivenessChecker} service - An instance of ILivenessChecker that provides methods
   * to check the service's liveness and manage service URLs.
   *
   * @returns {Promise<string>} - A promise that resolves with the reachable service URL.
   *
   * @throws {Error} - Throws an error if no reachable service URL is found after checking all URLs.
   *
   */
  async getAvailableStack(urls: string[], service: ILivenessChecker): Promise<ServiceUrl<N>> {
    const requestPromises: Promise<string>[] = [];
    for (let i = 0; i < urls.length; i++) {
      requestPromises.push(this.isAliveWithRetries(urls[i], service));
    }
    const result = await Promise.allSettled(requestPromises);
    for (const url of result) if (url.status == "fulfilled") return url.value;

    return this.handleErrorsOnSilentMode(`Failed to reach ${service.name} on all provided stacks`) as ServiceUrl<N>;
  }

  /**
   * Retrieves available service URLs for all configured services.
   *
   * This method iterates through the configured services, checks their availability,
   * and returns an object containing the reachable service URLs.
   *
   * @returns {Promise<{ [key: string]: ServiceUrl<N> }>} - A promise that resolves with an object where the keys are service names and the values are reachable service URLs.
   *
   */

  async getAvailableServicesStack(): Promise<{ [key: string]: ServiceUrl<N> }> {
    const result: { [key: string]: Promise<ServiceUrl<N>> } = {};

    for (const { URLs, service } of this.services) {
      result[service.name] = this.getAvailableStack(URLs, service);
    }

    const entries = Object.entries(result);
    const values = await Promise.all(entries.map(([_, promise]) => promise));
    for (let i = 0; i < entries.length; i++) {
      this.results[entries[i][0]] = values[i];
    }
    return this.results;
  }
}
