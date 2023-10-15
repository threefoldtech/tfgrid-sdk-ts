import { Network } from "../primitives/network";
import { Deployment } from "../zos/deployment";

enum Operations {
  deploy = "deploy",
  update = "update",
  delete = "delete",
}

class TwinDeployment {
  constructor(
    public deployment: Deployment,
    public operation: Operations,
    public publicIps: number,
    public nodeId: number,
    public network: Network | null = null,
    public solutionProviderId: number | null = null,
    public returnNetworkContracts = false,
  ) {}
}

export { TwinDeployment, Operations };
