import { KeypairType } from "@polkadot/util-crypto/types";

/**
 * Represents a basic service interface.
 */
interface IServiceBase {
  /**
   * The name of the service.
   */
  Name: string;

  /**
   * The URL of the service.
   */
  URL: string;
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
 */
export interface ILivenessChecker extends IServiceBase {
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

export type RMBProps = {
  chainUrl: string;
  relayUrl?: string;
  mnemonics: string;
  session: string;
  keypairType: KeypairType;
};

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
 * Options for configuring the stack manager.
 * @template N - A boolean type that defaults to false, represents silent property type This will effect the result type as well.
 */
export type StackManagerOptions<N extends boolean = false> = {
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
