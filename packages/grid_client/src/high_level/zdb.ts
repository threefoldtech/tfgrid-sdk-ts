import { GridClientErrors } from "@threefold/types";

import { events } from "../helpers/events";
import { Operations, TwinDeployment } from "../high_level/models";
import { DeploymentFactory } from "../primitives/deployment";
import { ZdbPrimitive } from "../primitives/zdb";
import { Deployment } from "../zos/deployment";
import { WorkloadTypes } from "../zos/workload";
import { ZdbModes } from "../zos/zdb";
import { HighLevelBase } from "./base";

class ZdbHL extends HighLevelBase {
  async create(
    name: string,
    node_id: number,
    disk_size: number,
    mode: ZdbModes,
    password: string,
    publicNamespace: boolean,
    metadata = "",
    description = "",
    solutionProviderId?: number,
  ): Promise<TwinDeployment> {
    if (!(await this.nodes.nodeHasResources(node_id, { hru: disk_size }))) {
      throw new GridClientErrors.Nodes.InvalidResourcesError(
        `Node ${node_id} doesn't have enough resources: hru=${disk_size} .`,
      );
    }
    events.emit("logs", `Creating a zdb on node: ${node_id}`);
    const deploymentFactory = new DeploymentFactory(this.config);
    const zdbFactory = new ZdbPrimitive();
    const zdbWorkload = zdbFactory.create(name, disk_size, mode, password, publicNamespace, metadata, description);
    const deployment = deploymentFactory.create([zdbWorkload], 1626394539, metadata, description, 0);
    return new TwinDeployment(deployment, Operations.deploy, 0, node_id, null, solutionProviderId);
  }
  async delete(deployment: Deployment, names: string[]) {
    return await this._delete(deployment, names, [WorkloadTypes.zdb]);
  }
}
export { ZdbHL };
