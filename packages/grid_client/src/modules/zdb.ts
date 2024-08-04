import { Contract } from "@threefold/tfchain_client";
import { ValidationError } from "@threefold/types";

import { GridClientConfig } from "../config";
import { events } from "../helpers/events";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { DeploymentResultContracts, TwinDeployment } from "../high_level/models";
import { ZdbHL } from "../high_level/zdb";
import { Deployment } from "../zos";
import { WorkloadTypes } from "../zos/workload";
import { Zdb, ZdbResult } from "../zos/zdb";
import { BaseModule } from "./base";
import { AddZDBModel, DeleteZDBModel, ZDBDeleteModel, ZDBGetModel, ZDBSModel } from "./models";
import { checkBalance } from "./utils";

export interface ZdbData {
  version: number;
  contractId: number;
  nodeId: number;
  name: string;
  created: number;
  status: string;
  message: string;
  size: number;
  mode: string;
  publicNamespace: boolean;
  password: string;
  metadata: string;
  description: string;
  resData: ZdbResult;
}

class ZdbsModule extends BaseModule {
  moduleName = "zdb";
  workloadTypes = [WorkloadTypes.zdb];
  zdb: ZdbHL;
  /**
   * Represents a module for managing ZDB deployments.
   *
   * This class extends the BaseModule class and provides methods for creating, updating, listing, and deleting ZDB deployments.
   *
   * @class ZdbsModule
   * @param {GridClientConfig} config - The configuration object for initializing the client.
   */
  constructor(public config: GridClientConfig) {
    super(config);
    this.zdb = new ZdbHL(config);
  }

  /**
   * Creates ZDB deployments based on the provided options.
   *
   * @param {ZDBSModel} options - The options for creating ZDB deployments.
   * @returns {Promise<TwinDeployment[]>} - A promise that resolves to an array of TwinDeployment objects representing the created deployments.
   */
  async _createDeployment(options: ZDBSModel): Promise<TwinDeployment[]> {
    const twinDeployments: TwinDeployment[] = [];
    const zdbs_names: string[] = [];
    const contractMetadata = JSON.stringify({
      version: 3,
      type: "zdb",
      name: options.name,
      projectName: this.config.projectName || `zdb/${options.name}`,
    });
    for (const instance of options.zdbs) {
      if (zdbs_names.includes(instance.name))
        throw new ValidationError(`Another zdb with the same name ${instance.name} already exists.`);
      zdbs_names.push(instance.name);

      const twinDeployment = await this.zdb.create(
        instance.name,
        instance.node_id,
        instance.disk_size,
        instance.mode,
        instance.password,
        instance.publicNamespace,
        contractMetadata,
        options.metadata,
        options.description,
        instance.solutionProviderId,
      );
      twinDeployments.push(twinDeployment);
    }
    return twinDeployments;
  }

  /**
   * Creates ZDB deployments based on the provided options.
   *
   * This method checks if a ZDB deployment with the same name already exists, emits a log event, creates the ZDB deployment, handles the twin deployments, saves the contracts, and returns the contracts.
   *
   * @param {ZDBSModel} options - The options for creating ZDB deployments.
   * @returns {Promise<{ contracts: DeploymentResultContracts }>} - A promise that resolves to an object containing the contracts of the created deployments.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async deploy(options: ZDBSModel): Promise<{ contracts: DeploymentResultContracts }> {
    if (await this.exists(options.name)) {
      throw new ValidationError(`Another zdb deployment with the same name ${options.name} already exists.`);
    }
    events.emit("logs", `Start creating the ZDB deployment with name ${options.name}`);
    const twinDeployments = await this._createDeployment(options);
    const contracts = await this.twinDeploymentHandler.handle(twinDeployments);
    await this.save(options.name, contracts);
    return { contracts: contracts };
  }

  /**
   * Retrieves a list of ZDB deployments.
   *
   * This method fetches and returns a list of ZDB deployments.
   *
   * @returns {Promise<string[]>} - A promise that resolves to an array of string representing the ZDB deployment names.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   */
  @expose
  async list(): Promise<string[]> {
    return await this._list();
  }

  /**
   * Retrieves information about ZDB deployments based on the provided deployment name.
   *
   * This method fetches the ZDB deployments associated with the specified deployment name, retrieves relevant information.
   *
   * @param {string} deploymentName - The name of the ZDB deployment to retrieve information for.
   * @returns {Promise<ZdbData[]>} - A promise that resolves to an array of ZdbData objects containing information about the ZDB deployments.
   */
  async getObj(deploymentName: string): Promise<ZdbData[]> {
    const deployments = await this._get(deploymentName);
    const workloads = await this._getWorkloadsByTypes(deploymentName, deployments, [WorkloadTypes.zdb]);
    const ret: ZdbData[] = [];
    for (const workload of workloads) {
      const data = workload.data as Zdb;
      ret.push({
        version: workload.version,
        contractId: workload["contractId"],
        nodeId: workload["nodeId"],
        name: workload.name,
        created: workload.result.created,
        status: workload.result.state,
        message: workload.result.message,
        size: data.size, // GB
        mode: data.mode,
        publicNamespace: data.public,
        password: data.password,
        metadata: workload.metadata,
        description: workload.description,
        resData: workload.result.data as ZdbResult,
      });
    }
    return ret;
  }

  /**
   * Retrieves information about ZDB deployments based on the provided deployment name.
   *
   * This method fetches the ZDB deployments associated with the specified deployment name, retrieves relevant information.
   *
   * @param {string} options.name - The name of the ZDB deployment to retrieve information for.
   * @returns {Promise<Deployment[]>} - A promise that resolves to an array of ZdbData objects containing information about the ZDB deployments.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async get(options: ZDBGetModel): Promise<Deployment[]> {
    return await this._get(options.name);
  }

  /**
   * Deletes a ZDB deployment based on the provided options.
   *
   * This method emits a log event, starts the deletion process for the ZDB deployment with the specified name, and then deletes the deployment.
   *
   * @param {ZDBDeleteModel} options - The options for deleting the ZDB deployment.
   * @returns { Promise<{created: Contract[];deleted: Contract[];updated: Contract[];}>} - A promise that resolves once the deletion process is completed.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async delete(options: ZDBDeleteModel): Promise<DeploymentResultContracts> {
    events.emit("logs", `Start deleting the ZDB deployment with name ${options.name}`);
    return await this._delete(options.name);
  }

  /**
   * Updates an existing ZDB deployment with the provided options.
   *
   * This method first checks if a ZDB deployment with the specified name exists, then retrieves the old deployments, creates new twin deployments based on the provided options, and finally updates the deployment with the new twin deployments.
   *
   * @param {ZDBSModel} options - The options for updating the ZDB deployment.
   * @returns {Promise<{contracts: DeploymentResultContracts;}>} - A promise that resolves once the update process is completed.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async update(options: ZDBSModel): Promise<{
    contracts: DeploymentResultContracts;
  }> {
    if (!(await this.exists(options.name))) {
      throw new ValidationError(`There is no zdb deployment with name: ${options.name}.`);
    }
    const oldDeployments = await this._get(options.name);
    const twinDeployments = await this._createDeployment(options);
    return await this._update(this.zdb, options.name, oldDeployments, twinDeployments);
  }

  /**
   * Adds a ZDB instance to an existing deployment.
   *
   * This method first checks if a ZDB deployment with the specified name exists, then retrieves the old deployments.
   * It validates if another ZDB with the same name already exists in the deployment.
   * If validation passes, it creates a new ZDB instance, emits a log event, and adds the ZDB instance to the deployment.
   *
   * @param {AddZDBModel} options - The options for adding a ZDB instance to a deployment.
   * @returns { Promise<{created: Contract[];deleted: Contract[];updated: Contract[];}>} A promise that resolves once the ZDB instance is successfully added to the deployment.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async add_zdb(options: AddZDBModel): Promise<{
    contracts: DeploymentResultContracts;
  }> {
    if (!(await this.exists(options.deployment_name))) {
      throw new ValidationError(`There is no zdb deployment with name: ${options.deployment_name}.`);
    }
    const oldDeployments = await this._get(options.deployment_name);
    if (this.workloadExists(options.name, oldDeployments))
      throw new ValidationError(
        `There is another zdb with the same name "${options.name}" in this deployment ${options.deployment_name}.`,
      );
    const contractMetadata = JSON.stringify({
      version: 3,
      type: "zdb",
      name: options.deployment_name,
      projectName: this.config.projectName || `zdb/${options.name}`,
    });
    events.emit("logs", `Start adding ZDB instance: ${options.name} to deployment: ${options.deployment_name}`);
    const twinDeployment = await this.zdb.create(
      options.name,
      options.node_id,
      options.disk_size,
      options.mode,
      options.password,
      options.publicNamespace,
      contractMetadata,
      oldDeployments[0].metadata,
      oldDeployments[0].description,
      options.solutionProviderId,
    );

    return await this._add(options.deployment_name, options.node_id, oldDeployments, [twinDeployment]);
  }

  /**
   * Deletes a ZDB instance from a deployment.
   *
   * This method first checks if a ZDB deployment with the specified name exists, then retrieves the old deployments.
   * It emits a log event, starts the deletion process for the ZDB instance with the specified name, and then deletes the instance from the deployment.
   *
   * @param {DeleteZDBModel} options - The options for deleting the ZDB instance.
   * @returns {Promise<DeploymentResultContracts>} - A promise that resolves once the deletion process is completed.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async delete_zdb(options: DeleteZDBModel): Promise<DeploymentResultContracts> {
    if (!(await this.exists(options.deployment_name))) {
      throw new ValidationError(`There is no zdb deployment with name: ${options.deployment_name}.`);
    }
    events.emit("logs", `Start deleting ZDB instance: ${options.name} from deployment: ${options.deployment_name}`);
    return await this._deleteInstance(this.zdb, options.deployment_name, options.name);
  }
}

export { ZdbsModule as zdbs };
