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

export type ServiceUrl<N extends boolean> = N extends false ? string : string | null;

export type Service = {
  URLs: string[];
  service: ILivenessChecker;
};
export type RMBProps = {
  chainUrl: string;
  relayUrl?: string;
  mnemonics: string;
  session: string;
  keypairType: KeypairType;
};

export type StackManagerOptions<N extends boolean = false> = {
  services: Service[];
  retries?: number;
  silent?: N;
};
