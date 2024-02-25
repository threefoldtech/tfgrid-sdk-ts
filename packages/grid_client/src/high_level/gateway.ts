import { DeploymentFactory, GWPrimitive } from "../primitives/index";
import { Workload } from "../zos";
import { HighLevelBase } from "./base";
import { Operations, TwinDeployment } from "./models";

class GatewayHL extends HighLevelBase {
  async create(
    name: string,
    node_id: number,
    tls_passthrough: boolean,
    backends: string[],
    network: string,
    contractMetadata: string,
    metadata: string,
    description: string,
    fqdn = "",
    solutionProviderId: number,
  ): Promise<TwinDeployment[]> {
    const public_ips = 0;
    const gw = new GWPrimitive();
    const workloads: Workload[] = [];
    if (fqdn != "") {
      workloads.push(gw.createFQDN(fqdn, tls_passthrough, backends, name, network, "", description));
    } else {
      workloads.push(gw.createName(name, tls_passthrough, backends, network, "", description));
    }
    const deploymentFactory = new DeploymentFactory(this.config);
    const deployment = deploymentFactory.create(workloads, 1626394539, metadata, description, 0);
    const twinDeployments: TwinDeployment[] = [];
    twinDeployments.push(
      new TwinDeployment(
        deployment,
        Operations.deploy,
        public_ips,
        node_id,
        contractMetadata,
        null,
        solutionProviderId,
      ),
    );
    return twinDeployments;
  }
}
export { GatewayHL };
