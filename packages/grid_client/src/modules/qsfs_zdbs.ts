import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { TwinDeployment } from "../high_level/models";
import { ZdbHL } from "../high_level/zdb";
import { ZdbBackend } from "../zos/qsfs";
import { WorkloadTypes } from "../zos/workload";
import { ZdbModes } from "../zos/zdb";
import { BaseModule } from "./base";
import { QSFSZDBDeleteModel, QSFSZDBGetModel, QSFSZDBSModel } from "./models";
import { checkBalance } from "./utils";

class QSFSZdbsModule extends BaseModule {
  moduleName = "qsfs_zdbs";
  workloadTypes = [WorkloadTypes.zdb];
  zdb: ZdbHL;
  constructor(config: GridClientConfig) {
    super(config);
    this.zdb = new ZdbHL(config);
  }

  async _createDeployment(options: QSFSZDBSModel): Promise<TwinDeployment[]> {
    if (options.count < 3) {
      throw Error("QSFS zdbs count can't be less than 3");
    }
    const count = options.count + 4; // 4 zdbs for meta
    const twinDeployments = [];
    const metadata = JSON.stringify({
      type: "QSFS",
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
        options.metadata || metadata,
        options.description,
        options.solutionProviderID,
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
      throw Error(`Another QSFS zdbs deployment with the same name ${options.name} already exists`);
    }
    const twinDeployments = await this._createDeployment(options);
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
  async get(options: QSFSZDBGetModel) {
    return await this._get(options.name);
  }

  @expose
  @validateInput
  @checkBalance
  async delete(options: QSFSZDBDeleteModel) {
    return await this._delete(options.name);
  }

  async getZdbs(name: string) {
    const deployments = await this._get(name);
    const zdbs = [];
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
    const qsfsZdbs = { meta: [], groups: [] };
    for (const zdb of zdbs) {
      const zdbBackend = new ZdbBackend();
      zdbBackend.namespace = zdb.result.data.namespace;
      zdbBackend.password = zdb.data.password;
      zdbBackend.address = `[${zdb.result.data.ips[1]}]:${zdb.result.data.port}`;
      zdbBackend["size"] = zdb.data.size;
      zdbBackend["contractId"] = zdb["contractId"];
      zdbBackend["nodeId"] = zdb["nodeId"];
      if (zdb.data.mode === ZdbModes.user) {
        qsfsZdbs.meta.push(zdbBackend);
      } else {
        qsfsZdbs.groups.push(zdbBackend);
      }
    }
    return qsfsZdbs;
  }
}

export { QSFSZdbsModule as qsfs_zdbs };
