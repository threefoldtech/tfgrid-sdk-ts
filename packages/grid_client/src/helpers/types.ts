interface VM {
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

export { VM };
