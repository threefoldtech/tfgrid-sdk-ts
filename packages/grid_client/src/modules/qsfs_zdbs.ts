import { Contract } from "@threefold/tfchain_client";
import { ValidationError } from "@threefold/types";

import { GridClientConfig } from "../config";
import { events } from "../helpers/events";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { DeploymentResultContracts, TwinDeployment } from "../high_level/models";
import { ZdbHL } from "../high_level/zdb";
import { Deployment } from "../zos";
import { ZdbBackend } from "../zos/qsfs";
import { Workload, WorkloadTypes } from "../zos/workload";
import { Zdb, ZdbModes, ZdbResult } from "../zos/zdb";
import { BaseModule } from "./base";
import { QSFSZDBDeleteModel, QSFSZDBGetModel, QSFSZDBSModel } from "./models";
import { checkBalance } from "./utils";

class QSFSZdbsModule extends BaseModule {
  moduleName = "qsfs_zdbs";
  workloadTypes = [WorkloadTypes.zdb];
  zdb: ZdbHL;
  /**
   * Represents a module for managing QSFS ZDB deployments.
   * This class extends the BaseModule class and provides methods for creating, deploying, listing, getting, and deleting QSFS ZDB deployments.
   * It also includes methods for checking balance before deploying, updating deployments, and retrieving ZDB information.
   *
   * @class QSFSZdbsModule
   * @param {GridClientConfig} config - The configuration object for initializing the client.
   */
  constructor(public config: GridClientConfig) {
    super(config);
    this.zdb = new ZdbHL(config);
  }

  /**
   * Creates multiple QSFS ZDB deployments based on the provided options.
   *
   * @param {QSFSZDBSModel} options - The options for creating the QSFS ZDB deployments.
   * @returns {Promise<TwinDeployment[]>} An array of TwinDeployment objects representing the created deployments.
   * @throws {`ValidationError`} If the count of QSFS zdbs is less than 3.
   */
  async _createDeployment(options: QSFSZDBSModel): Promise<TwinDeployment[]> {
    if (options.count < 3) {
      throw new ValidationError("QSFS zdbs count can't be less than 3.");
    }
    const count = options.count + 4; // 4 zdbs for meta
    const twinDeployments: TwinDeployment[] = [];
    const contractMetadata = JSON.stringify({
      version: 3,
      type: "qsfs",
      name: options.name,
      projectName: this.config.projectName,
    });
    for (let i = 1; i <= count; i++) {
      let mode = "seq";
      if (i > options.count) {
        mode = "user";
      }

      const nodeId = options.node_ids[(i - 1) % options.node_ids.length];
      const twinDeployment = await this.zdb.create(
        options.name + i,
        nodeId,
        options.disk_size,
        mode as ZdbModes,
        options.password,
        true,
        contractMetadata,
        options.metadata,
        options.description,
        options.solutionProviderId,
      );
      twinDeployments.push(twinDeployment);
    }
    return twinDeployments;
  }

  /**
   * Deploys multiple QSFS ZDB deployments based on the provided options.
   *
   * @param {QSFSZDBSModel} options - The options for deploying the QSFS ZDBs.
   * @returns {Promise<{ contracts: DeploymentResultContracts }>} An object containing the contracts of the deployed ZDBs.
   * @throws {ValidationError} If another QSFS ZDB deployment with the same name already exists.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async deploy(options: QSFSZDBSModel): Promise<{ contracts: DeploymentResultContracts }> {
    if (await this.exists(options.name)) {
      throw new ValidationError(`Another QSFS ZDBs deployment with the same name ${options.name} already exists.`);
    }
    events.emit("logs", `Start creating the QSFS ZDBs deployment with name ${options.name}`);
    const twinDeployments = await this._createDeployment(options);
    const contracts = await this.twinDeploymentHandler.handle(twinDeployments);
    await this.save(options.name, contracts);
    return { contracts: contracts };
  }

  /**
   * Retrieves a list of QSFS ZDB deployments.
   *
   * @returns {Promise<string[]>} An array of string representing the list of `deployment names`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   */
  @expose
  async list(): Promise<string[]> {
    return await this._list();
  }

  /**
   * Retrieves a QSFS ZDB deployment based on the provided options.
   *
   * @param {QSFSZDBGetModel} options - The options for retrieving the QSFS ZDB deployment.
   * @returns {Promise<Deployment[]>} A promise that resolves to the retrieved QSFS ZDB deployment.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async get(options: QSFSZDBGetModel): Promise<Deployment[]> {
    return await this._get(options.name);
  }

  /**
   * Deletes a QSFS ZDB deployment based on the provided options.
   *
   * @param {QSFSZDBDeleteModel} options - The options for deleting the QSFS ZDB deployment.
   * @returns {Promise<{created: Contract[];deleted: Contract[];updated: Contract[];}>} A promise that resolves once the deployment is deleted.
   * @throws {`ValidationError`} If there is an issue with deleting the deployment.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async delete(options: QSFSZDBDeleteModel): Promise<{
    created: Contract[];
    deleted: Contract[];
    updated: Contract[];
  }> {
    events.emit("logs", `Start deleting the QSFS ZDBs deployment with name ${options.name}`);
    return await this._delete(options.name);
  }

  /**
   * Retrieves QSFS ZDB deployments based on the provided name.
   *
   * @param {string} name - The name of the QSFS ZDB deployments to retrieve.
   * @returns {Promise<{ meta: ZdbBackend[]; groups: ZdbBackend[] }>} A promise that resolves to an object containing meta and groups of ZdbBackend objects representing the retrieved QSFS ZDB deployments.
   */
  async getZdbs(name: string): Promise<{ meta: ZdbBackend[]; groups: ZdbBackend[] }> {
    const deployments = await this._get(name);
    const zdbs: Workload[] = [];
    for (const deployment of deployments) {
      for (const workload of deployment.workloads) {
        if (workload.type !== WorkloadTypes.zdb) {
          continue;
        }
        workload["contractId"] = deployment.contract_id;
        workload["nodeId"] = await this._getNodeIdFromContractId(name, deployment.contract_id);
        zdbs.push(workload);
      }
    }
    const qsfsZdbs: { meta: ZdbBackend[]; groups: ZdbBackend[] } = { meta: [], groups: [] };
    for (const zdb of zdbs) {
      const data = zdb.data as Zdb;
      const result = zdb.result.data as ZdbResult;
      const zdbBackend = new ZdbBackend();
      zdbBackend.namespace = result.Namespace;
      zdbBackend.password = data.password;
      zdbBackend.address = `[${result.IPs[1]}]:${result.Port}`;
      zdbBackend["size"] = data.size;
      zdbBackend["contractId"] = zdb["contractId"];
      zdbBackend["nodeId"] = zdb["nodeId"];
      if (data.mode === ZdbModes.user) {
        qsfsZdbs.meta.push(zdbBackend);
      } else {
        qsfsZdbs.groups.push(zdbBackend);
      }
    }
    return qsfsZdbs;
  }
}

export { QSFSZdbsModule as qsfs_zdbs };
