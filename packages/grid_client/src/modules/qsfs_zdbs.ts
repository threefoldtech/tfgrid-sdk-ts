import { ValidationError } from "@threefold/types";

import { GridClientConfig } from "../config";
import { events } from "../helpers/events";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { TwinDeployment } from "../high_level/models";
import { ZdbHL } from "../high_level/zdb";
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
  constructor(public config: GridClientConfig) {
    super(config);
    this.zdb = new ZdbHL(config);
  }

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

  @expose
  @validateInput
  @checkBalance
  async deploy(options: QSFSZDBSModel) {
    if (await this.exists(options.name)) {
      throw new ValidationError(`Another QSFS ZDBs deployment with the same name ${options.name} already exists.`);
    }
    events.emit("logs", `Start creating the QSFS ZDBs deployment with name ${options.name}`);
    const twinDeployments = await this._createDeployment(options);
    const contracts = await this.twinDeploymentHandler.handle(twinDeployments);
    return { contracts: contracts };
  }

  @expose
  async list() {
    return await this._list();
  }

  @expose
  @validateInput
  async get(options: QSFSZDBGetModel) {
    return await this._get(options.name);
  }

  @expose
  @validateInput
  @checkBalance
  async delete(options: QSFSZDBDeleteModel) {
    events.emit("logs", `Start deleting the QSFS ZDBs deployment with name ${options.name}`);
    return await this._delete(options.name);
  }

  async getZdbs(name: string) {
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
