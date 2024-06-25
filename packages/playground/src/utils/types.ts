export enum IPType {
  single = "Single",
  range = "Range",
}
export enum Selection {
  AUTOMATED = "automated",
  MANUAL = "manual",
}

export interface IPublicConfig {
  ipv4: string;
  gw4: string;
  ipv6?: string;
  gw6?: string;
  domain?: string;
}

export interface VM {
  version: number;
  contractId: number;
  nodeId: number;
  name: string;
  created: number;
  status: string;
  message: string;
  flist: string;
  publicIP: string;
  planetary: string;
  myceliumIP: string;
  customDomain?: string;
  interfaces: {
    network: string;
    ip: string;
  }[];
  capacity: {
    cpu: number;
    memory: number;
  };
  mounts: any[];
  env: {
    SSH_KEY: string;
  };
  entrypoint: string;
  metadata?: any;
  description?: any;
  rootfs_size: number;
  corex: boolean;
  gpu: any[];
  deploymentName: string;
  projectName: string;
  wireguard: string;
}
