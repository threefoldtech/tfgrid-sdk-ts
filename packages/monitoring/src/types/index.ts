interface IServiceInfo {
  ServiceName: string;
}

export interface IServiceAliveness extends IServiceInfo {
  isAlive: () => Promise<ServiceStatus>;
}

export type ServiceStatus = {
  alive: boolean;
  error?: Error;
};
