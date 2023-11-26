import { ValidationError } from "@threefold/types";

import { GridClientConfig } from "../config";
import { events } from "../helpers/events";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { TwinDeployment } from "../high_level/models";
import { ZdbHL } from "../high_level/zdb";
import { WorkloadTypes } from "../zos/workload";
import { Zdb, ZdbResult } from "../zos/zdb";
import { BaseModule } from "./base";
import { AddZDBModel, DeleteZDBModel, ZDBDeleteModel, ZDBGetModel, ZDBSModel } from "./models";
import { checkBalance } from "./utils";

class ZdbsModule extends BaseModule {
  fileName = "zdbs.json";
  workloadTypes = [WorkloadTypes.zdb];
  zdb: ZdbHL;
  constructor(config: GridClientConfig) {
    super(config);
    this.zdb = new ZdbHL(config);
  }

  async _createDeployment(options: ZDBSModel): Promise<TwinDeployment[]> {
    const twinDeployments: TwinDeployment[] = [];
    const zdbs_names: string[] = [];
    const metadata = JSON.stringify({
      type: "zdb",
      name: options.name,
      projectName: this.config.projectName,
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
        options.metadata || metadata,
        options.description,
        instance.solutionProviderId,
      );
      twinDeployments.push(twinDeployment);
    }
    return twinDeployments;
  }

  @expose
  @validateInput
  @checkBalance
  async deploy(options: ZDBSModel) {
    if (await this.exists(options.name)) {
      throw new ValidationError(`Another zdb deployment with the same name ${options.name} already exists.`);
    }
    events.emit("logs", `Start creating the ZDB deployment with name ${options.name}`);
    const twinDeployments = await this._createDeployment(options);
    const contracts = await this.twinDeploymentHandler.handle(twinDeployments);
    await this.save(options.name, contracts);
    return { contracts: contracts };
  }

  @expose
  async list() {
    return await this._list();
  }

  async getObj(deploymentName: string) {
    const deployments = await this._get(deploymentName);
    const workloads = await this._getWorkloadsByTypes(deploymentName, deployments, [WorkloadTypes.zdb]);
    const ret = [];
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

  @expose
  @validateInput
  async get(options: ZDBGetModel) {
    return await this._get(options.name);
  }

  @expose
  @validateInput
  @checkBalance
  async delete(options: ZDBDeleteModel) {
    events.emit("logs", `Start deleting the ZDB deployment with name ${options.name}`);
    return await this._delete(options.name);
  }

  @expose
  @validateInput
  @checkBalance
  async update(options: ZDBSModel) {
    if (!(await this.exists(options.name))) {
      throw new ValidationError(`There is no zdb deployment with name: ${options.name}.`);
    }
    const oldDeployments = await this._get(options.name);
    const twinDeployments = await this._createDeployment(options);
    return await this._update(this.zdb, options.name, oldDeployments, twinDeployments);
  }

  @expose
  @validateInput
  @checkBalance
  async add_zdb(options: AddZDBModel) {
    if (!(await this.exists(options.deployment_name))) {
      throw new ValidationError(`There is no zdb deployment with name: ${options.deployment_name}.`);
    }
    const oldDeployments = await this._get(options.deployment_name);
    if (this.workloadExists(options.name, oldDeployments))
      throw new ValidationError(
        `There is another zdb with the same name "${options.name}" in this deployment ${options.deployment_name}.`,
      );
    events.emit("logs", `Start adding ZDB instance: ${options.name} to deployment: ${options.deployment_name}`);
    const twinDeployment = await this.zdb.create(
      options.name,
      options.node_id,
      options.disk_size,
      options.mode,
      options.password,
      options.publicNamespace,
      oldDeployments[0].metadata,
      oldDeployments[0].metadata,
      options.solutionProviderId,
    );

    return await this._add(options.deployment_name, options.node_id, oldDeployments, [twinDeployment]);
  }

  @expose
  @validateInput
  @checkBalance
  async delete_zdb(options: DeleteZDBModel) {
    if (!(await this.exists(options.deployment_name))) {
      throw new ValidationError(`There is no zdb deployment with name: ${options.deployment_name}.`);
    }
    events.emit("logs", `Start deleting ZDB instance: ${options.name} from deployment: ${options.deployment_name}`);
    return await this._deleteInstance(this.zdb, options.deployment_name, options.name);
  }
}

export { ZdbsModule as zdbs };
