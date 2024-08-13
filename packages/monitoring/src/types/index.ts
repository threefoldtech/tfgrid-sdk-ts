/**
 * Represents a basic service interface.
 */
export interface IServiceBase {
  /**
   * The name of the service.
   */
  name: string;

  /**
   * The URL of the service.
   */
  url: string;
}

/**
 * Represents a service with liveness checking capability.
 */
export interface ILivenessChecker extends IServiceBase {
  /**
   * Checks if the service is alive.
   * @returns {Promise<ServiceStatus>} A promise that resolves with the current status of the service.
   */
  isAlive: (url?: string) => Promise<ServiceStatus>;
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
  /**
   * Optional. timeout for each request in secondes;
   */
  timeout?: number;
};

export type ServiceUrl<N extends boolean> = N extends false ? string : string | null;
