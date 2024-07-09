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
  "GirdProxy" = "gridproxy",
  "GraphQl" = "graphql",
  "RMB" = "rmb",
  "tfChain" = "tfChain",
}

export type ServicesUrls = {
  [key in ServiceName]?: string;
};
type ServicesStacks = {
  [key in ServiceName]?: string[];
};
export type StackPickerOptions = ServicesStacks & { mnemonic?: string; keypairType?: KeypairType; retries?: number };
