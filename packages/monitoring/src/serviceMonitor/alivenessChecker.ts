import { KeypairType } from "@polkadot/util-crypto/types";

import { monitorEvents } from "../helpers/events";
import { IDisconnectHandler, ILivenessChecker, Service, ServiceUrl, StackManagerOptions } from "../types";
import { ActivationMonitor } from "./activation";
import { GraphQLMonitor } from "./graphql";
import { GridProxyMonitor } from "./gridproxy";
import { RMBMonitor } from "./rmb";
import { StatsMonitor } from "./stats";
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
          monitorEvents.storeStatus(service.Name, alive);
          break;
        }
        if (retryCount < this.retries) {
          monitorEvents.log(`${service.Name} seems to be down; Retrying (${retryCount}/${this.retries})...`);
          await new Promise(resolve => setTimeout(resolve, this.retryInterval * 60));
        } else monitorEvents.serviceDown(service.Name, error);
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

/**
 * Manages service URLs, checking their availability and ensuring they are reachable.
 *
 * @property {number} retries - Number of retry attempts for each URL.
 * @property {string[]} [ServiceName.tfChain] - URLs for tfChain service.
 * @property {string[]} [ServiceName.GraphQl] - URLs for GraphQL service.
 * @property {string[]} [ServiceName.RMB] - URLs for RMB service.
 * @property {string[]} [ServiceName.GridPrixy] - URLs for GridProxy service.
 * @property {string[]} [ServiceName.Stats] - URLs for stats service.
 * @property {string[]} [ServiceName.Activation] - URLs for activation service.
 * @property {string} [mnemonic] - Mnemonic required for RMB service.
 * @property {KeypairType} keypairType - Type of keypair, default is "sr25519".
 * @property {boolean} rmbValidatesChain - Indicates if RMB will validate the chain url.
 * @property {string[]} rmbTFchainUrls - URLs of TFChain for RMB service, Required in case there is no TFChain urls for tfChain service.
 * If there is a tfChain availability service provided, and it's result is valid, we will ignore the rmb-tfChain options
 * @property {boolean} silent - To return null instead of throw an Error, Default is False
 */
export class ServiceUrlManager<N extends boolean = false> {
  // private result: ServicesUrls<N> = {};
  private retries = 3;
  private silent: N = false as N;
  private services: Service[];

  constructor(options?: StackManagerOptions<N>) {
    console.log(this);
    Object.assign(this, options);
    console.log(this, options);
  }

  // /**
  //  * Pings the given service to check if it is alive.
  //  *
  //  * This method checks the liveness of the provided service by calling its `isAlive` method.
  //  * If the service supports disconnection (implements IDisconnectHandler), it calls the `disconnect` method after the liveness check.
  //  *
  //  * @param {ILivenessChecker} service - An instance of ILivenessChecker that provides methods to check the service's liveness.
  //  *
  //  * @returns {Promise<{alive: boolean, error?: Error}>} - A promise that resolves with the liveness status of the service.
  //  */
  // private async pingService(service: ILivenessChecker) {
  //   const status = await service.isAlive();
  //   if ("disconnect" in service) {
  //     await (service as IDisconnectHandler).disconnect();
  //   }
  //   return status;
  // }

  // /**
  //  * Attempts to find a reachable service URL from a list of provided URLs.
  //  *
  //  * This method iterates through the list of URLs, repeatedly pinging the service to
  //  * check if it is alive. If a reachable URL is found, it is returned. If all URLs
  //  * are exhausted without finding a reachable service, an error is thrown.
  //  *
  //  * @param {string[]} urls - An array of service URLs to check for reachability.
  //  * @param {ILivenessChecker} service - An instance of ILivenessChecker that provides methods
  //  * to check the service's liveness and manage service URLs.
  //  *
  //  * @returns {Promise<string>} - A promise that resolves with the reachable service URL.
  //  *
  //  * @throws {Error} - Throws an error if no reachable service URL is found after checking all URLs.
  //  *
  //  */
  // async getAvailableServiceStack(urls: string[], service: ILivenessChecker): Promise<ServiceUrl<N>> {
  //   let error: Error | string = "";
  //   for (let i = 0; i < urls.length; i++) {
  //     if (i != 0) await service.updateUrl(urls[i]);
  //     monitorEvents.log(`${service.serviceName()}: pinging ${service.serviceUrl()}`, "gray");
  //     for (let retry = 0; retry < this.retries; retry++) {
  //       const status = await this.pingService(service);
  //       if (status.alive) {
  //         monitorEvents.log(`${service.serviceName()} on ${service.serviceUrl()} Success!`, "green");
  //         return service.serviceUrl();
  //       }
  //       error = status.error ?? "";
  //     }
  //     monitorEvents.log(
  //       `${service.serviceName()}: failed to ping ${service.serviceUrl()} after ${this.retries} retries; ${error}`,
  //       "red",
  //     );
  //   }
  //   if (this.silent) return null as any;
  //   throw new Error(` Failed to reach ${service.serviceName()} on all provided stacks`);
  // }

  // /**
  //  * Fetches available service URLs for tfChain and RMB services.
  //  *
  //  * This method checks the availability of URLs for services by utilizing
  //  * the `getAvailableServiceStack` method. It updates the `result` property with the reachable URLs.
  //  *
  //  * @returns {Promise<ServicesUrls>} - A promise that resolves with an object containing the available service URLs.
  //  */
  // async getAvailableServices(): Promise<ServicesUrls<N>> {
  //   const result: any = {};

  //   if (this[ServiceName.GraphQl]) {
  //     if (this[ServiceName.GraphQl]?.length == 0)
  //       result[ServiceName.GraphQl] = this.handleSilent(
  //         "Can't validate GraphQL stacks; There is GraphQL urls provided",
  //       );
  //     else {
  //       result[ServiceName.GraphQl] = this.getAvailableServiceStack(
  //         this[ServiceName.GraphQl],
  //         new GraphQLMonitor(this[ServiceName.GraphQl][0]),
  //       );
  //     }
  //   }

  //   if (this[ServiceName.GridPrixy]) {
  //     if (this[ServiceName.GridPrixy]?.length == 0) {
  //       result[ServiceName.GridPrixy] = this.handleSilent(
  //         "Can't validate GridProxy stacks; There is GridProxy urls provided",
  //       );
  //     } else {
  //       result[ServiceName.GridPrixy] = this.getAvailableServiceStack(
  //         this[ServiceName.GridPrixy],
  //         new GridProxyMonitor(this[ServiceName.GridPrixy][0]),
  //       );
  //     }
  //   }

  //   if (this[ServiceName.Stats]) {
  //     if (this[ServiceName.Stats]?.length == 0) {
  //       result[ServiceName.Stats] = this.handleSilent("Can't validate Stats stacks; There is Stats urls provided");
  //     } else {
  //       result[ServiceName.Stats] = this.getAvailableServiceStack(
  //         this[ServiceName.Stats],
  //         new Stats(this[ServiceName.Stats][0]),
  //       );
  //     }
  //   }

  //   if (this[ServiceName.Activation]) {
  //     if (this[ServiceName.Activation]?.length == 0) {
  //       result[ServiceName.Activation] = this.handleSilent(
  //         "Can't validate Activation stacks; There is Activation urls provided",
  //       );
  //     } else {
  //       result[ServiceName.Activation] = this.getAvailableServiceStack(
  //         this[ServiceName.Activation],
  //         new Activation(this[ServiceName.Activation][0]),
  //       );
  //     }
  //   }

  //   if (this[ServiceName.tfChain]) {
  //     if (this[ServiceName.tfChain]?.length == 0) {
  //       result[ServiceName.tfChain] = this.handleSilent(
  //         "Can't validate tfChain stacks; There is tfChain urls provided",
  //       );
  //     } else {
  //       result[ServiceName.tfChain] = this.getAvailableServiceStack(
  //         this[ServiceName.tfChain],
  //         new TFChainMonitor(this[ServiceName.tfChain][0]),
  //       );
  //     }
  //   }

  //   if (this[ServiceName.RMB])
  //     result[ServiceName.RMB] = this.validateRMBStacks(this[ServiceName.RMB], this.result?.tfChain);

  //   const entries = Object.entries(result);
  //   const values = await Promise.all(entries.map(r => r[1]));
  //   for (let i = 0; i < entries.length; i++) this.result[entries[i][0]] = values[i];
  //   return this.result;
  // }

  // private handleSilent(errorMsg: string) {
  //   if (this.silent) {
  //     console.log(errorMsg);
  //     return null;
  //   }
  //   throw new Error(errorMsg);
  // }

  // private async validateRMBStacks(rmbUrls: string[], validatedChainUrl?: ServiceUrl<N> | undefined) {
  //   if (!this.mnemonic) return this.handleSilent("Failed to validate RMB, Mnemonic is required");

  //   let chainUrl: ServiceUrl<N> | undefined = undefined;
  //   if (rmbUrls.length == 0) return this.handleSilent("Can't validate RMB stacks; There is RMB urls provided");
  //   if (!validatedChainUrl && (!this.rmbTFchainUrls || this.rmbTFchainUrls.length == 0))
  //     return this.handleSilent("Can't validate RMB urls; There is no Chain urls provided");

  //   // chain Url
  //   if (validatedChainUrl) chainUrl = validatedChainUrl;
  //   else
  //     chainUrl = this.rmbValidatesChain
  //       ? await this.getAvailableServiceStack(this.rmbTFchainUrls, new TFChainMonitor(this.rmbTFchainUrls[0]))
  //       : this.rmbTFchainUrls[0];
  //   if (!chainUrl) return this.handleSilent("Failed to validate RMB, there is no available valid Chain url");

  //   return this.getAvailableServiceStack(
  //     rmbUrls,
  //     new RMBMonitor(rmbUrls[0], chainUrl, this.mnemonic!, this.keypairType),
  //   );
  // }
}
