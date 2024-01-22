interface IServiceInfo {
  ServiceName: string;
}

export interface IServiceAliveness extends IServiceInfo {
  isAlive: () => Promise<boolean>;
}
