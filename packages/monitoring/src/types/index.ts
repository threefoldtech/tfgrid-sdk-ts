import { KeypairType } from "@polkadot/util-crypto/types";
/**
 * Represents a basic service interface.
 * @template P - The type of the parameter object used for the update method.
 */
interface IServiceBase<P> {
  /**
   * The name of the service.
   */
  name: string;

  /**
   * The URL of the service.
   */
  url: string;

  /**
   * Updates the service with the provided parameters.
   * @param {P} param - The parameter object with specific keys, should be specified on class.
   */
  update(param: P): void;
}

/**
 * Represents a handler for disconnecting a service.
 */
export interface IDisconnectHandler {
  /**
   * Performs the disconnection from the service.
   * @returns {Promise<void>} A promise that resolves when the disconnection is successful.
   */
  disconnect: () => Promise<void>;
}

/**
 * Represents a service with liveness checking capability.
 * @template P - The type of the parameter object used for the update method. Defaults to {url:string}.
 */
export interface ILivenessChecker<P = { url: string }> extends IServiceBase<P> {
  /**
   * Checks if the service is alive.
   * @returns {Promise<ServiceStatus>} A promise that resolves with the current status of the service.
   */
  isAlive: () => Promise<ServiceStatus>;
}

export type ServiceStatus = {
  alive: boolean;
  error?: Error;
};

export enum MonitorEvents {
  "log" = "MonitorLog",
  "summarize" = "MonitorSummarize",
  "storeStatus" = "MonitorStoreStatus",
  "serviceDown" = "MonitorServiceDown",
}

/**
 * Represents a service with its stacks and its ILivenessChecker instance.
 */
export type Service = {
  /**
   * An array of URLs <Stacks> associated with the service.
   */
  URLs: string[];
  /**
   * An instance of a liveness checker for the service.
   */
  service: ILivenessChecker;
};

/**
 * Options for configuring the URL manager.
 * @template N - A boolean type that defaults to false, represents silent property type This will effect the result type as well.
 */
export type URLManagerOptions<N extends boolean = false> = {
  /**
   * An array of services to be managed by the stack manager.
   */
  services: Service[];
  /**
   * Optional. The number of retries for failed service checks for each stack.
   */
  retries?: number;
  /**
   * Optional. Determines if the stack manager should operate silently without throwing any errors and just return null as result.
   */
  silent?: N;
};

export type ServiceUrl<N extends boolean> = N extends false ? string : string | null;
