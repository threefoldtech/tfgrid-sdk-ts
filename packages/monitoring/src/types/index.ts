import { KeypairType } from "@polkadot/util-crypto/types";
/**
 * Represents a basic service interface.
 * @template P - The type of the parameter object used for the update method.
 */
interface IServiceBase<P> {
  /**
   * The name of the service.
   */
  Name: string;

  /**
   * The URL of the service.
   */
  URL: string;

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

export type RMBProps = {
  chainUrl: string;
  relayUrl?: string;
  mnemonics: string;
  session: string;
  keypairType: KeypairType;
};
