export interface IServiceMonitor {
  ServiceName: string;
  ServiceURL: string;
  LiveChecker: () => Promise<boolean>;
  disconnectHandler?: () => void;
}

interface ServiceConfig {
  LivenessURL: string;
  //healthEndPoint: string;
}

export interface TFServices {
  gridProxy?: ServiceConfig;
  graphQL?: ServiceConfig;
  tfChain?: ServiceConfig;
  rmb?: ServiceConfig;
}
