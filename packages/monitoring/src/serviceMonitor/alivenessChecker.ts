import { KeypairType } from "@polkadot/util-crypto/types";

import { monitorEvents } from "../helpers/events";
import { IDisconnectHandler, ILivenessChecker, ServiceName, ServicesUrls, StackPickerOptions } from "../types";
import { GraphQLMonitor } from "./graphql";
import { GridProxyMonitor } from "./gridproxy";
import { RMBMonitor } from "./rmb";
import { TFChainMonitor } from "./tfChain";

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

  /**
   * Disconnects services that implement the `IDisconnectHandler` interface.
   * @returns A promise that resolves when all services are disconnected.
   */
  public async disconnect(): Promise<void> {
    for (const service of this.services) {
      if ("disconnect" in service) {
        await (service as IDisconnectHandler).disconnect();
      }
    }
  }

  /**
   * Monitors the services at a regular interval and returns a function to exit and disconnect the monitoring.
   * @returns An object with a function `exitAndDisconnect` to stop the monitoring and disconnect services.
   */
  public monitorService(): { exitAndDisconnect: () => Promise<void> } {
    if (this.services.length === 0) throw new Error("No services to monitor");

    monitorEvents.log(`Checking services status...`);
    this.checkLivenessOnce();
    const intervalId = setInterval(async () => await this.checkLivenessOnce(), this.interval * 60 * 1000);

    /**
     * Stops the monitoring and disconnects the services.
     * @returns A promise that resolves when the monitoring is stopped and services are disconnected.
     */
    const exitAndDisconnect = async (): Promise<void> => {
      clearInterval(intervalId);
      await this.disconnect();
    };
    return { exitAndDisconnect };
  }

  /**
   * Checks the liveness of each service once and disconnects the services.
   */
  public async pingService(): Promise<void> {
    await this.checkLivenessOnce();
    await this.disconnect();
  }
}

export class ServiceUrlManager {
  private result: ServicesUrls = {};
  private retries = 3;
  private [ServiceName.tfChain]?: string[];
  private [ServiceName.GraphQl]?: string[];
  private [ServiceName.RMB]?: string[];
  private [ServiceName.GirdProxy]?: string[];
  private mnemonic?: string;
  private keypairType?: KeypairType = "sr25519";

  constructor(options: StackPickerOptions) {
    Object.assign(this, options);
  }

  /**
   * Pings the given service to check if it is alive.
   *
   * This method checks the liveness of the provided service by calling its `isAlive` method.
   * If the service supports disconnection (implements IDisconnectHandler), it calls the `disconnect` method after the liveness check.
   *
   * @param {ILivenessChecker} service - An instance of ILivenessChecker that provides methods to check the service's liveness.
   *
   * @returns {Promise<{alive: boolean, error?: Error}>} - A promise that resolves with the liveness status of the service.
   */
  private async pingService(service: ILivenessChecker) {
    const status = await service.isAlive();
    if ("disconnect" in service) {
      await (service as IDisconnectHandler).disconnect();
    }
    return status;
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
  async getAvailableServiceStack(urls: string[], service: ILivenessChecker) {
    let error: Error;
    for (let i = 0; i < urls.length; i++) {
      if (i != 0) await service.updateUrl(urls[i]);
      monitorEvents.log(`${service.serviceName()}: pinging ${service.serviceUrl()}`, "gray");
      for (let retry = 0; retry < this.retries; retry++) {
        const status = await this.pingService(service);
        if (status.alive) {
          monitorEvents.log(`${service.serviceName()} on ${service.serviceUrl()} Success!`, "green");
          return service.serviceUrl();
        }
        error = status.error;
      }
      monitorEvents.log(
        `${service.serviceName()}: failed to ping ${service.serviceUrl()} after ${this.retries} retries; ${error}`,
        "red",
      );
    }
    throw new Error(` Failed to reach ${service.serviceName()} on all provided stacks`);
  }

  /**
   * Fetches available service URLs for tfChain and RMB services.
   *
   * This method checks the availability of URLs for services by utilizing
   * the `getAvailableServiceStack` method. It updates the `result` property with the reachable URLs.
   *
   * @returns {Promise<ServicesUrls>} - A promise that resolves with an object containing the available service URLs.
   */
  async GetAvailableServices(): Promise<ServicesUrls> {
    if (this[ServiceName.tfChain]?.length > 0)
      this.result[ServiceName.tfChain] = await this.getAvailableServiceStack(
        this[ServiceName.tfChain],
        new TFChainMonitor(this[ServiceName.tfChain][0]),
      );
    if (this[ServiceName.RMB]?.length > 0) {
      if (!this.result[ServiceName.tfChain]) throw new Error("Can't validate RMB urls; There is no Chain ulr provided");
      this.result[ServiceName.RMB] = await this.getAvailableServiceStack(
        this[ServiceName.RMB],
        new RMBMonitor(this[ServiceName.RMB][0], this.result[ServiceName.tfChain], this.mnemonic, this.keypairType),
      );
    }
    if (this[ServiceName.GraphQl]?.length > 0) {
      this.result[ServiceName.GraphQl] = await this.getAvailableServiceStack(
        this[ServiceName.GraphQl],
        new GraphQLMonitor(this[ServiceName.GraphQl][0]),
      );
    }
    if (this[ServiceName.GirdProxy]?.length > 0) {
      this.result[ServiceName.GirdProxy] = await this.getAvailableServiceStack(
        this[ServiceName.GirdProxy],
        new GridProxyMonitor(this[ServiceName.GirdProxy][0]),
      );
    }

    return this.result;
  }
}
