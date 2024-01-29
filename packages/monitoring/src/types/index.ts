interface IServiceBase {
  serviceName: () => string;
  serviceUrl: () => string;
}

export interface IDisconnectHandler {
  disconnect: () => Promise<void>;
}
export interface ILivenessChecker extends IServiceBase {
  isAlive: () => Promise<ServiceStatus>;
}

export type ServiceStatus = {
  alive: boolean;
  error?: Error;
};
