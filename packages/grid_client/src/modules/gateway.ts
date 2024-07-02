import { Contract } from "@threefold/tfchain_client";
import { ValidationError } from "@threefold/types";

import { GridClientConfig } from "../config";
import { GatewayDeploymentData } from "../helpers";
import { events } from "../helpers/events";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { DeploymentResultContracts } from "../high_level";
import { GatewayHL } from "../high_level/gateway";
import { Deployment } from "../zos";
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

  /**
   * Represents a module for managing gateway deployments.
   *
   * This class extends the `BaseModule` class and provides methods for deploying, listing, getting, and deleting gateway deployments.
   * It includes functionality to deploy gateways with FQDN and name, check balance before deployment, and handle deployment updates.
   * The module also supports retrieving specific gateway instances, deleting instances, and getting detailed information about deployments.
   *
   * @class GWModule
   * @param {GridClientConfig} config - The configuration object for initializing the client.
   */
  constructor(public config: GridClientConfig) {
    super(config);
    this.gateway = new GatewayHL(config);
  }

  /**
   * Deploys a gateway with FQDN.
   *
   * This method deploys a gateway with the provided FQDN configuration.
   *
   * It checks if another gateway deployment with the same name already exists,
   * emits a log event, creates the gateway deployment, handles the twin deployments,
   * saves the contracts, and returns the deployed contracts.
   *
   * @param {GatewayFQDNModel} options - The options for deploying the gateway with FQDN.
   * @returns {Promise<{ contracts: DeploymentResultContracts }>} A Promise that resolves an object containing the deployed contracts.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async deploy_fqdn(options: GatewayFQDNModel): Promise<{ contracts: DeploymentResultContracts }> {
    if (await this.exists(options.name)) {
      throw new ValidationError(`Another gateway deployment with the same name ${options.name} already exists.`);
    }
    events.emit("logs", `Start creating the gateway deployment with name ${options.name}`);
    const contractMetadata = JSON.stringify({
      version: 3,
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
      contractMetadata,
      options.metadata,
      options.description,
      options.fqdn,
      options.solutionProviderId,
    );
    const contracts = await this.twinDeploymentHandler.handle(twinDeployments);
    await this.save(options.name, contracts);
    return { contracts: contracts };
  }

  /**
   * Deploys a gateway with a given name.
   *
   * This method deploys a gateway with the provided name configuration.
   * It checks if another gateway deployment with the same name already exists,
   * emits a log event, creates the gateway deployment, handles the twin deployments,
   * saves the contracts, and returns the deployed contracts.
   *
   * @param {GatewayNameModel} options - The options for deploying the gateway with a specific name.
   * @returns {Promise<{ contracts: DeploymentResultContracts }>} A Promise that resolves an object containing the deployed contracts.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async deploy_name(options: GatewayNameModel): Promise<{ contracts: DeploymentResultContracts }> {
    if (await this.exists(options.name)) {
      throw new ValidationError(`Another gateway deployment with the same name ${options.name} already exists.`);
    }
    events.emit("logs", `Start creating the gateway deployment with name ${options.name}`);
    const contractMetadata = JSON.stringify({
      version: 3,
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
      contractMetadata,
      options.metadata,
      options.description,
      "",
      options.solutionProviderId,
    );
    const contracts = await this.twinDeploymentHandler.handle(twinDeployments);
    await this.save(options.name, contracts);
    return { contracts: contracts };
  }

  /**
   * Retrieves a list of gateway deployments.
   *
   * This method fetches and returns a list of gateway deployments.
   *
   * @returns {Promise<string[]>} A Promise that resolves to a list of gateway deployments.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   */
  @expose
  async list(): Promise<string[]> {
    return await this._list();
  }

  /**
   * Retrieves a gateway deployment with FQDN based on the provided options.
   *
   * This method fetches and returns detailed information about a specific gateway deployment with FQDN,
   * identified by the name specified in the options.
   *
   * @param {GatewayFQDNGetModel} options - The options specifying the name of the gateway deployment to retrieve.
   * @returns {Promise<Deployment[]>} A Promise that resolves to the detailed information of the gateway deployment.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async get_fqdn(options: GatewayFQDNGetModel): Promise<Deployment[]> {
    return await this._get(options.name);
  }

  /**
   * Deletes a gateway deployment with FQDN.
   *
   * This method deletes a gateway deployment with the specified name.
   * It emits a log event indicating the start of the deletion process,
   * and then proceeds to delete the gateway deployment with the provided name.
   *
   * @param {GatewayFQDNDeleteModel} options - The options specifying the name of the gateway deployment to delete.
   * @returns {Promise<{created: Contract[];deleted: Contract[];updated: Contract[];}>} A Promise that resolves once the gateway deployment is successfully deleted.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async delete_fqdn(options: GatewayFQDNDeleteModel): Promise<{
    created: Contract[];
    deleted: Contract[];
    updated: Contract[];
  }> {
    events.emit("logs", `Start deleting the ZDB deployment with name ${options.name}`);
    return await this._delete(options.name);
  }

  /**
   * Retrieves detailed information about a specific gateway deployment with a given name.
   *
   * This method fetches and returns detailed information about a specific gateway deployment identified by the name specified in the options.
   *
   * @param {GatewayNameGetModel} options - The options specifying the name of the gateway deployment to retrieve.
   * @returns {Promise<Deployment[]>} A Promise that resolves to the detailed information of the gateway deployment.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async get_name(options: GatewayNameGetModel): Promise<Deployment[]> {
    return await this._get(options.name);
  }

  /**
   * Deletes a gateway deployment with a specific name.
   *
   * This method initiates the deletion process for a gateway deployment identified by the provided name.
   * It emits a log event indicating the start of the deletion process and proceeds to delete the gateway deployment with the specified name.
   *
   * @param {GatewayNameDeleteModel} options - The options specifying the name of the gateway deployment to delete.
   * @returns {Promise<{ created: Contract[]; deleted: Contract[]; updated: Contract[]; }>} A Promise that resolves once the gateway deployment is successfully deleted.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async delete_name(options: GatewayNameDeleteModel): Promise<{
    created: Contract[];
    deleted: Contract[];
    updated: Contract[];
  }> {
    events.emit("logs", `Start deleting the ZDB deployment with name ${options.name}`);
    return await this._delete(options.name);
  }

  /**
   * Retrieves detailed information about a specific gateway deployment.
   *
   * This method fetches and returns detailed information about a specific gateway deployment identified by the provided deployment name.
   * It retrieves the necessary data from the deployments and workloads.
   *
   * @param {string} deploymentName - The name of the gateway deployment to retrieve information for.
   * @returns {Promise<GatewayDeploymentData[]>} A Promise that resolves to an array of objects containing detailed information about the gateway deployment.
   */
  async getObj(deploymentName: string): Promise<GatewayDeploymentData[]> {
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
