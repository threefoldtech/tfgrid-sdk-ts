import { ValidationError } from "@threefold/types";

import { GridClientConfig } from "../config";
import { events } from "../helpers/events";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { GatewayHL } from "../high_level/gateway";
import { GatewayFQDNProxy, GatewayResult } from "../zos/gateway";
import { WorkloadTypes } from "../zos/workload";
import { BaseModule } from "./base";
import {
  GatewayFQDNDeleteModel,
  GatewayFQDNGetModel,
  GatewayFQDNModel,
  GatewayNameDeleteModel,
  GatewayNameGetModel,
  GatewayNameModel,
} from "./models";
import { checkBalance } from "./utils";

class GWModule extends BaseModule {
  moduleName = "gateways";
  workloadTypes = [WorkloadTypes.gatewayfqdnproxy, WorkloadTypes.gatewaynameproxy];
  gateway: GatewayHL;

  constructor(config: GridClientConfig) {
    super(config);
    this.gateway = new GatewayHL(config);
  }

  @expose
  @validateInput
  @checkBalance
  async deploy_fqdn(options: GatewayFQDNModel) {
    if (await this.exists(options.name)) {
      throw new ValidationError(`Another gateway deployment with the same name ${options.name} already exists`);
    }
    events.emit("logs", `Start creating the gateway deployment with name ${options.name}`);
    const metadata = JSON.stringify({
      type: "gateway",
      name: options.name,
      projectName: this.config.projectName,
    });
    const twinDeployments = await this.gateway.create(
      options.name,
      options.node_id,
      options.tls_passthrough,
      options.backends,
      options.network,
      options.metadata || metadata,
      options.description,
      options.fqdn,
      options.solutionProviderId,
    );
    const contracts = await this.twinDeploymentHandler.handle(twinDeployments);
    await this.save(options.name, contracts);
    return { contracts: contracts };
  }

  @expose
  @validateInput
  @checkBalance
  async deploy_name(options: GatewayNameModel) {
    if (await this.exists(options.name)) {
      throw new ValidationError(`Another gateway deployment with the same name ${options.name} already exists`);
    }
    events.emit("logs", `Start creating the gateway deployment with name ${options.name}`);
    const metadata = JSON.stringify({
      type: "gateway",
      name: options.name,
      projectName: this.config.projectName,
    });
    const twinDeployments = await this.gateway.create(
      options.name,
      options.node_id,
      options.tls_passthrough,
      options.backends,
      options.network,
      options.metadata || metadata,
      options.description,
      "",
      options.solutionProviderId,
    );
    const contracts = await this.twinDeploymentHandler.handle(twinDeployments);
    await this.save(options.name, contracts);
    return { contracts: contracts };
  }

  @expose
  async list() {
    return await this._list();
  }

  @expose
  @validateInput
  async get_fqdn(options: GatewayFQDNGetModel) {
    return await this._get(options.name);
  }

  @expose
  @validateInput
  @checkBalance
  async delete_fqdn(options: GatewayFQDNDeleteModel) {
    events.emit("logs", `Start deleting the ZDB deployment with name ${options.name}`);
    return await this._delete(options.name);
  }

  @expose
  @validateInput
  async get_name(options: GatewayNameGetModel) {
    return await this._get(options.name);
  }

  @expose
  @validateInput
  @checkBalance
  async delete_name(options: GatewayNameDeleteModel) {
    events.emit("logs", `Start deleting the ZDB deployment with name ${options.name}`);
    return await this._delete(options.name);
  }

  async getObj(deploymentName: string) {
    const deployments = await this._get(deploymentName);
    const workloads = await this._getWorkloadsByTypes(deploymentName, deployments, [
      WorkloadTypes.gatewayfqdnproxy,
      WorkloadTypes.gatewaynameproxy,
    ]);
    return workloads.map(workload => {
      const data = workload.data as GatewayFQDNProxy;
      return {
        version: workload.version,
        contractId: workload["contractId"],
        name: workload.name,
        created: workload.result.created,
        status: workload.result.state,
        message: workload.result.message,
        type: workload.type,
        domain:
          workload.type === WorkloadTypes.gatewayfqdnproxy ? data.fqdn : (workload.result.data as GatewayResult).fqdn,
        tls_passthrough: data.tls_passthrough,
        backends: data.backends,
        metadata: workload.metadata,
        description: workload.description,
      };
    });
  }
}

export { GWModule as gateway };
