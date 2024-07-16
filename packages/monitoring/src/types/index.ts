import { KeypairType } from "@polkadot/util-crypto/types";

/**
 * Represents a basic service interface.
 */
interface IServiceBase {
  /**
   * Returns the name of the service.
   * @returns {string} The service name.
   */
  serviceName: () => string;

  /**
   * Returns the URL of the service.
   * @returns {string} The service URL.
   */
  serviceUrl: () => string;

  /**
   * Updates the service URL.
   * This method sets a new URL for the service, updating its internal state to point to the provided URL.
   * @param {string} url - The new URL to be set for the service.
   */
  updateUrl: (url: string) => void;
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

export enum ServiceName {
  "GridPrixy" = "gridproxy",
  "GraphQl" = "graphql",
  "RMB" = "rmb",
  "tfChain" = "tfChain",
  "Activation" = "activation",
  "Stats" = "stats",
}
export type ServiceUrl<N extends boolean> = N extends false ? string : string | null;

export type ServicesUrls<N extends boolean> = {
  [key in ServiceName]?: ServiceUrl<N>;
};
type ServicesStacks = {
  [key in ServiceName]?: string[];
};
export type StackPickerOptions<N extends boolean = false> = ServicesStacks & {
  mnemonic?: string;
  keypairType?: KeypairType;
  retries?: number;
  rmbTFchainUrls?: string[];
  rmbValidatesChain?: boolean;
  silent?: N;
};
