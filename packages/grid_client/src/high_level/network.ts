import { Addr } from "netaddr";

import { DeploymentFactory, Network } from "../primitives";
import { WorkloadTypes, Znet } from "../zos";
import { HighLevelBase } from "./base";
import { Operations, TwinDeployment } from "./models";

class NetworkHL extends HighLevelBase {
  async addNode(networkName: string, ipRange: string, nodeId: number, solutionProviderId: number, description = "") {
    const network = new Network(networkName, ipRange, this.config);
    await network.load();
    const networkMetadata = JSON.stringify({
      type: "network",
      name: networkName,
      projectName: this.config.projectName,
    });

    const workload = await network.addNode(nodeId, networkMetadata, description);
    if (!workload) {
      throw Error(`Node ${nodeId} is already exist on network ${networkName}`);
    }

    const twinDeployments: TwinDeployment[] = [];
    const deploymentFactory = new DeploymentFactory(this.config);
    const deployment = deploymentFactory.create([workload], 0, networkMetadata, description, 0);
    twinDeployments.push(
      new TwinDeployment(deployment, Operations.deploy, 0, nodeId, network, solutionProviderId, true),
    );

    if (!(await network.exists())) {
      return twinDeployments;
    }
    // update network if it's already exist
    for (const deployment of network.deployments) {
      const d = await deploymentFactory.fromObj(deployment);
      for (const workload of d.workloads) {
        const data = workload.data as Znet;
        if (workload.type !== WorkloadTypes.network || !Addr(network.ipRange).contains(Addr(data.subnet))) {
          continue;
        }
        workload.data = network.updateNetwork(data);
        workload.version += 1;
        break;
      }
      twinDeployments.push(new TwinDeployment(d, Operations.update, 0, 0, network, solutionProviderId, true));
    }
    return twinDeployments;
  }

  async hasNode(networkName: string, ipRange: string, nodeId: number): Promise<boolean> {
    const network = new Network(networkName, ipRange, this.config);
    await network.load();
    return network.nodeExists(nodeId);
  }
}

export { NetworkHL };
