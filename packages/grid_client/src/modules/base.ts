import { Contract } from "@threefold/tfchain_client";
import { GridClientErrors, ValidationError } from "@threefold/types";
import * as PATH from "path";

import { GqlNodeContract, RMB } from "../clients";
import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { formatErrorMessage } from "../helpers";
import { HighLevelBase } from "../high_level/base";
import { KubernetesHL } from "../high_level/kubernetes";
import { VMHL } from "../high_level/machine";
import { DeploymentResultContracts, Operations, TwinDeployment } from "../high_level/models";
import { TwinDeploymentHandler } from "../high_level/twinDeploymentHandler";
import { ZdbHL } from "../high_level/zdb";
import { DeploymentFactory } from "../primitives/deployment";
import { Network } from "../primitives/network";
import { Nodes } from "../primitives/nodes";
import { BackendStorage, BackendStorageType } from "../storage/backend";
import { Deployment } from "../zos/deployment";
import { PublicIPResult } from "../zos/public_ip";
import { QuantumSafeFS, QuantumSafeFSResult } from "../zos/qsfs";
import { Workload, WorkloadTypes } from "../zos/workload";
import { Zmachine, ZmachineResult } from "../zos/zmachine";
import { Zmount } from "../zos/zmount";
import { ContractStates } from "./models";

const modulesNames = {
  machines: "vm",
  kubernetes: "kubernetes",
  gateways: "gateway",
  qsfs_zdbs: "qsfs",
  zdb: "zdb",
};
class BaseModule {
  moduleName = "";
  projectName = "";
  workloadTypes: WorkloadTypes[] = [];
  rmb: RMB;
  deploymentFactory: DeploymentFactory;
  twinDeploymentHandler: TwinDeploymentHandler;
  backendStorage: BackendStorage;
  tfClient: TFClient;
  contracts: Required<GqlNodeContract>[];
  static newContracts: GqlNodeContract[] = [];
  static deletedContracts: number[] = [];

  constructor(public config: GridClientConfig) {
    this.projectName = config.projectName;
    this.rmb = new RMB(config.rmbClient);
    this.deploymentFactory = new DeploymentFactory(config);
    this.twinDeploymentHandler = new TwinDeploymentHandler(config);
    this.backendStorage = new BackendStorage(
      config.backendStorageType,
      config.substrateURL,
      config.mnemonic,
      config.storeSecret,
      config.keypairType,
      config.backendStorage,
      config.seed,
    );
    this.tfClient = config.tfclient;
  }

  getNewDeploymentPath(...paths: string[]): string {
    return PATH.join(this.config.storePath, this.moduleName, this.projectName, ...paths);
  }

  getDeploymentPath(name: string): string {
    return PATH.join(this.config.storePath, this.projectName, this.moduleName, name);
  }

  async getOldDeploymentContracts(name: string) {
    const path = this.getNewDeploymentPath(name, "contracts.json");
    const contracts = await this.backendStorage.load(path);
    if (!contracts) {
      return [];
    }
    return contracts;
  }

  async getDeploymentContracts(name: string) {
    const contracts = await this.getMyContracts();
    return contracts.filter(c => c.parsedDeploymentData.name === name);
  }

  async save(name: string, contracts: DeploymentResultContracts) {
    const contractsPath = PATH.join(this.getNewDeploymentPath(name), "contracts.json");
    const wireguardPath = PATH.join(this.getDeploymentPath(name), `${name}.conf`);
    const oldContracts = await this.getOldDeploymentContracts(name);
    let StoreContracts = oldContracts;
    let backendOperations = [];

    for (const contract of contracts.created) {
      if (!contract.contractType.nodeContract) continue;
      BaseModule.newContracts.push({
        contractID: String(contract.contractId),
        createdAt: Date.now().toString(),
        deploymentData: contract.contractType.nodeContract.deploymentData,
        deploymentHash: contract.contractType.nodeContract.deploymentHash,
        gridVersion: "4",
        id: "",
        nodeID: contract.contractType.nodeContract.nodeId,
        numberOfPublicIPs: contract.contractType.nodeContract.publicIps,
        solutionProviderID: String(contract.solutionProviderId),
        state: ContractStates.Created,
        twinID: String(contract.twinId),
        parsedDeploymentData: JSON.parse(contract.contractType.nodeContract.deploymentData),
        resourcesUsed: undefined,
      });
    }

    for (const contract of contracts.deleted) {
      BaseModule.deletedContracts.push(contract.contractId);
      StoreContracts = StoreContracts.filter(c => c["contract_id"] !== contract.contractId);
      const contractPath = PATH.join(this.config.storePath, "contracts", `${contract.contractId}.json`);
      backendOperations = backendOperations.concat(await this.backendStorage.dump(contractPath, ""));
    }
    if (StoreContracts.length !== 0) {
      backendOperations = backendOperations.concat(await this.backendStorage.dump(contractsPath, StoreContracts));
    } else {
      backendOperations = backendOperations.concat(await this.backendStorage.dump(contractsPath, ""));
      backendOperations = backendOperations.concat(await this.backendStorage.dump(wireguardPath, "")); // left for cleaning up the old deployment after deletion
    }
    if (
      this.config.backendStorageType === BackendStorageType.tfkvstore &&
      backendOperations &&
      backendOperations.length > 0
    ) {
      backendOperations = backendOperations.filter(e => e !== undefined);
      if (backendOperations.length > 0) {
        await this.tfClient.connect();
        await this.tfClient.applyAllExtrinsics(backendOperations);
      }
    }
  }

  async _migrateListKeys(): Promise<void> {
    const oldPath = this.getDeploymentPath("");
    const keys = await this.backendStorage.list(oldPath);

    if (this.backendStorage.type === BackendStorageType.tfkvstore) {
      const exts = await Promise.all(
        keys.map(key =>
          this.backendStorage.storage.moveValue!(
            PATH.join(oldPath, key, "contracts.json"),
            this.getNewDeploymentPath(key, "contracts.json"),
          ),
        ),
      );
      await this.tfClient.applyAllExtrinsics(exts.flat(1).filter(Boolean));
      return;
    }

    const __getValue = (key: string) => {
      const path = PATH.join(oldPath, key, "contracts.json");
      return this.backendStorage.load(path).catch(error => {
        console.log(`Error while fetching key('${key}'):`, error.message || error);
      });
    };

    const values = await Promise.all(keys.map(__getValue));

    const __updatePath = (key: string, index: number) => {
      const value = values[index];
      const from = PATH.join(oldPath, key, "contracts.json");
      const to = this.getNewDeploymentPath(key, "contracts.json");

      if (!value || from === to) {
        return Promise.resolve(null);
      }

      return [this.backendStorage.dump(to, value), this.backendStorage.remove(from)];
    };

    await Promise.all(keys.map(__updatePath).flat(1));
  }

  private async getMyContracts(fetch = false) {
    if (fetch || !this.contracts) {
      let contracts = await this.tfClient.contracts.listMyNodeContracts({
        graphqlURL: this.config.graphqlURL,
        type: modulesNames[this.moduleName],
        projectName: this.projectName,
      });
      const alreadyFetchedContracts: GqlNodeContract[] = [];
      for (const contract of BaseModule.newContracts) {
        if (contract.parsedDeploymentData?.projectName !== this.projectName) continue;
        if (contract.parsedDeploymentData.type !== modulesNames[this.moduleName]) continue;
        const c = contracts.filter(c => +c.contractID === +contract.contractID);
        if (c.length > 0) {
          alreadyFetchedContracts.push(contract);
          continue;
        }
        contracts.push(contract);
      }

      for (const contract of alreadyFetchedContracts) {
        const index = BaseModule.newContracts.indexOf(contract);
        if (index > -1) BaseModule.newContracts.splice(index, 1);
      }

      contracts = contracts.filter(c => !BaseModule.deletedContracts.includes(+c.contractID));

      const parsedContracts: Required<GqlNodeContract>[] = [];
      for (const contract of contracts) {
        const parsedDeploymentData = JSON.parse(contract.deploymentData);
        parsedContracts.push({ ...contract, parsedDeploymentData });
      }

      this.contracts = parsedContracts;
    }

    return this.contracts;
  }

  private _getContractsName(contracts: Required<GqlNodeContract>[]): string[] {
    return Array.from(new Set(contracts.map(c => c.parsedDeploymentData.name)));
  }

  async _list(): Promise<string[]> {
    await this._migrateListKeys();
    const contracts = await this.getMyContracts(true);
    return this._getContractsName(contracts);
  }

  async exists(name: string): Promise<boolean> {
    return (await this._list()).includes(name);
  }

  workloadExists(name: string, oldDeployment: Deployment[]): boolean {
    for (const deployment of oldDeployment) {
      for (const workload of deployment.workloads) {
        if (name === workload.name) return true;
      }
    }
    return false;
  }

  async _getDeploymentNodeIds(name: string): Promise<number[]> {
    const nodeIds: number[] = [];
    const contracts = await this.getDeploymentContracts(name);
    for (const contract of contracts) {
      nodeIds.push(contract.nodeID);
    }
    return nodeIds;
  }

  async _getContractIdFromNodeId(name: string, nodeId: number): Promise<number> {
    const contracts = await this.getDeploymentContracts(name);
    for (const contract of contracts) {
      if (contract.nodeID === nodeId) {
        return +contract.contractID;
      }
    }
    return 0;
  }
  async _getNodeIdFromContractId(name: string, contractId: number): Promise<number> {
    const contracts = await this.getDeploymentContracts(name);
    for (const contract of contracts) {
      if (+contract.contractID === contractId) {
        return contract.nodeID;
      }
    }
    return 0;
  }

  async _getWorkloadsByTypes(deploymentName: string, deployments, types: WorkloadTypes[]): Promise<Workload[]> {
    const r = [];
    for (const deployment of deployments) {
      for (const workload of deployment.workloads) {
        if (types.includes(workload.type)) {
          workload["contractId"] = deployment.contract_id;
          workload["nodeId"] = await this._getNodeIdFromContractId(deploymentName, deployment.contract_id);
          r.push(workload);
        }
      }
    }
    return r;
  }

  async _getMachinePubIP(deploymentName: string, deployments, publicIPWorkloadName: string): Promise<PublicIPResult> {
    const publicIPWorkloads = await this._getWorkloadsByTypes(deploymentName, deployments, [
      WorkloadTypes.ip,
      WorkloadTypes.ipv4,
    ]);
    for (const workload of publicIPWorkloads) {
      if (workload.name === publicIPWorkloadName) {
        return workload.result.data as PublicIPResult;
      }
    }
    return null;
  }

  async _getZmachineData(deploymentName: string, deployments, workload: Workload): Promise<Record<string, unknown>> {
    const data = workload.data as Zmachine;
    const resultData = workload.result.data as ZmachineResult;
    return {
      version: workload.version,
      contractId: workload["contractId"],
      nodeId: workload["nodeId"],
      name: workload.name,
      created: workload.result.created,
      status: workload.result.state,
      message: workload.result.message,
      flist: data.flist,
      publicIP: await this._getMachinePubIP(deploymentName, deployments, data.network.public_ip),
      planetary: data.network.planetary ? resultData.planetary_ip : resultData.ygg_ip,
      myceliumIP: data.network.mycelium?.hex_seed ? resultData.mycelium_ip : "",
      interfaces: data.network.interfaces.map(n => ({
        network: n.network,
        ip: n.ip,
      })),
      capacity: {
        cpu: data.compute_capacity.cpu,
        memory: data.compute_capacity.memory / 1024 ** 2, // MB
      },
      mounts: data.mounts
        ? data.mounts.map(m => ({
            name: m.name,
            mountPoint: m.mountpoint,
            ...this._getDiskData(deployments, m.name, workload["contractId"]),
          }))
        : [],
      env: data.env,
      entrypoint: data.entrypoint,
      metadata: workload.metadata,
      description: workload.description,
      rootfs_size: data.size,
      corex: data.corex,
      gpu: data.gpu,
    };
  }

  _getDiskData(deployments: Deployment[], name: string, contractId: number) {
    for (const deployment of deployments) {
      if (deployment.contract_id !== contractId) continue;
      for (const workload of deployment.workloads) {
        if (workload.type === WorkloadTypes.zmount && workload.name === name) {
          return {
            size: (workload.data as Zmount).size,
            state: workload.result.state,
            message: workload.result.message,
          };
        } else if (workload.type === WorkloadTypes.qsfs && workload.name === name) {
          const data = workload.data as QuantumSafeFS;
          const metadata = JSON.parse(workload.metadata);
          return {
            cache: data.cache,
            prefix: data.config.meta.config.prefix,
            minimal_shards: data.config.minimal_shards,
            expected_shards: data.config.expected_shards,
            qsfs_zdbs_name: metadata.qsfs_zdbs_name,
            state: workload.result.state,
            message: workload.result.message,
            metricsEndpoint: (workload.result.data as QuantumSafeFSResult).metrics_endpoint,
            size: metadata.qsfs_size,
          };
        }
      }
    }
  }

  async _get(name: string): Promise<Deployment[]> {
    const deployments: Deployment[] = [];
    if (!(await this._list()).includes(name)) {
      return deployments;
    }
    const contracts = await this.getDeploymentContracts(name);
    if (contracts.length === 0) {
      await this.save(name, { created: [], updated: [], deleted: [] });
    }
    await this.tfClient.connect();
    for (const contract of contracts) {
      const c = await this.tfClient.contracts.get({ id: +contract.contractID });
      if (c === null) {
        await this.save(name, { created: [], updated: [], deleted: [{ contractId: +contract.contractID }] });
        continue;
      }
      const nodes = new Nodes(this.config.graphqlURL, this.config.proxyURL, this.config.rmbClient);
      const node_twin_id = await nodes.getNodeTwinId(contract.nodeID);
      const payload = JSON.stringify({ contract_id: +contract.contractID });
      let deployment;
      try {
        deployment = await this.rmb.request([node_twin_id], "zos.deployment.get", payload);
      } catch (e) {
        (e as Error).message = formatErrorMessage(`Failed to get deployment`, e);
      }
      let found = false;
      for (const workload of deployment.workloads) {
        if (this.workloadTypes.includes(workload.type) && workload.result.state !== "deleted") {
          found = true;
          break;
        }
      }
      if (found) {
        deployments.push(deployment);
      } else {
        await this.save(name, { created: [], updated: [], deleted: [{ contractId: +contract.contractID }] });
      }
    }
    return deployments;
  }

  async _updateWithPubIP(
    module: KubernetesHL | ZdbHL | VMHL,
    name: string,
    oldDeployments: Deployment[],
    twinDeployments: TwinDeployment[],
    network: Network = null,
  ) {
    let finalTwinDeployments: TwinDeployment[] = [];
    const doneDeploymentIPWorkloadNames: string[] = [];

    for (let oldDeployment of oldDeployments) {
      oldDeployment = await this.deploymentFactory.fromObj(oldDeployment);
      const pubIPOLdWorkload = oldDeployment.workloads.filter(
        workload => workload.type === WorkloadTypes.ip && workload.data["v4"],
      )[0].name;
      const node_id = await this._getNodeIdFromContractId(name, oldDeployment.contract_id);
      for (const twinDeployment of twinDeployments) {
        if (twinDeployment.nodeId !== node_id) {
          continue;
        }
        const pubIPTwinWorkload = twinDeployment.deployment.workloads.filter(
          workload => workload.type === WorkloadTypes.ip && workload.data["v4"],
        )[0].name;

        if (pubIPOLdWorkload != pubIPTwinWorkload) {
          continue;
        }

        doneDeploymentIPWorkloadNames.push(pubIPOLdWorkload);
        const updateOldDeployment = await this.deploymentFactory.UpdateDeployment(
          oldDeployment,
          twinDeployment.deployment,
          network,
        );
        if (!updateOldDeployment) {
          continue;
        }
        finalTwinDeployments.push(new TwinDeployment(updateOldDeployment, Operations.update, 0, 0, "", network));
      }
      if (!doneDeploymentIPWorkloadNames.includes(pubIPOLdWorkload)) {
        const tDeployments = await module.delete(oldDeployment, []);
        finalTwinDeployments = finalTwinDeployments.concat(tDeployments);
      }
    }

    for (const twinDeployment of twinDeployments) {
      const pubIPTwinWorkload = twinDeployment.deployment.workloads.filter(
        workload => workload.type === WorkloadTypes.ip && workload.data["v4"],
      )[0].name;
      if (!doneDeploymentIPWorkloadNames.includes(pubIPTwinWorkload)) {
        finalTwinDeployments.push(twinDeployment);
      }
    }
    return finalTwinDeployments;
  }

  async _updateWithoutPubIP(
    module: KubernetesHL | ZdbHL | VMHL,
    name: string,
    oldDeployments: Deployment[],
    twinDeployments: TwinDeployment[],
    network: Network = null,
  ) {
    let finalTwinDeployments: TwinDeployment[] = [];

    for (let oldDeployment of oldDeployments) {
      oldDeployment = await this.deploymentFactory.fromObj(oldDeployment);
      const node_id = await this._getNodeIdFromContractId(name, oldDeployment.contract_id);
      let deploymentFound = false;
      for (const twinDeployment of twinDeployments) {
        if (twinDeployment.nodeId !== node_id) {
          continue;
        }
        const updateOldDeployment = await this.deploymentFactory.UpdateDeployment(
          oldDeployment,
          twinDeployment.deployment,
          network,
        );
        deploymentFound = true;
        if (!updateOldDeployment) {
          continue;
        }
        finalTwinDeployments.push(new TwinDeployment(updateOldDeployment, Operations.update, 0, 0, "", network));
        break;
      }
      if (!deploymentFound) {
        const tDeployments = await module.delete(oldDeployment, []);
        finalTwinDeployments = finalTwinDeployments.concat(tDeployments);
      }
    }

    return finalTwinDeployments;
  }

  async reject_update_pubIP_of_oldDeployment(
    oldDeployments: Deployment[],
    twinDeployments: TwinDeployment[],
    name: string,
  ) {
    for (let oldDeployment of oldDeployments) {
      let pubIPOldWorkload = "";
      const zmachineOldWorkloads: string[] = [];
      oldDeployment.workloads.forEach(workload => {
        if (workload.type === WorkloadTypes.ip && workload.data["v4"]) pubIPOldWorkload = workload.name;
        else if (workload.type === WorkloadTypes.zmachine) zmachineOldWorkloads.push(workload.name);
      });

      if (pubIPOldWorkload != "" && twinDeployments.length == 0)
        throw new GridClientErrors.Workloads.WorkloadUpdateError(
          `Cannot remove a public IP of an existent deployment.`,
        );

      oldDeployment = await this.deploymentFactory.fromObj(oldDeployment);
      const node_id = await this._getNodeIdFromContractId(name, oldDeployment.contract_id);

      for (const pubIPTwinDeployment of twinDeployments) {
        if (pubIPTwinDeployment.nodeId !== node_id) {
          continue;
        }

        let pubIPTwinWorkload = "";
        const zmachineTwinWorkloads: string[] = [];
        pubIPTwinDeployment.deployment.workloads.forEach(workload => {
          if (workload.type === WorkloadTypes.ip && workload.data["v4"]) pubIPTwinWorkload = workload.name;
          else if (workload.type === WorkloadTypes.zmachine) zmachineTwinWorkloads.push(workload.name);
        });

        if (zmachineOldWorkloads.filter(value => zmachineTwinWorkloads.includes(value)).length == 0) continue;

        if (pubIPTwinWorkload != pubIPOldWorkload) {
          if (pubIPTwinWorkload == "")
            throw new GridClientErrors.Workloads.WorkloadUpdateError(
              `Cannot remove a public IP of an existent deployment.`,
            );
          if (pubIPOldWorkload == "")
            throw new GridClientErrors.Workloads.WorkloadUpdateError(
              `Cannot add a public IP to an existent deployment.`,
            );
        }
      }
    }
  }

  filter_pub_and_noPub_deployments(deployments: TwinDeployment[] | Deployment[]) {
    const pubIPDeployments = [];
    const noPubIPDeployments = [];
    deployments.forEach(d => {
      let pubIPCondition = false;
      if (d instanceof TwinDeployment)
        pubIPCondition =
          d.deployment.workloads.filter(workload => workload.type === WorkloadTypes.ip && workload.data["v4"]).length >
          0;
      else
        pubIPCondition =
          d.workloads.filter(workload => workload.type === WorkloadTypes.ip && workload.data["v4"]).length > 0;

      if (pubIPCondition) pubIPDeployments.push(d);
      else noPubIPDeployments.push(d);
    });
    return [pubIPDeployments, noPubIPDeployments];
  }

  async _update(
    module: KubernetesHL | ZdbHL | VMHL,
    name: string,
    oldDeployments: Deployment[],
    twinDeployments: TwinDeployment[],
    network: Network = null,
  ) {
    let finalTwinDeployments: TwinDeployment[] = [];
    finalTwinDeployments = twinDeployments.filter(d => d.operation === Operations.update);
    twinDeployments = this.twinDeploymentHandler.deployMerge(twinDeployments);
    const deploymentNodeIds = await this._getDeploymentNodeIds(name);

    // add deployments on other nodes
    finalTwinDeployments = finalTwinDeployments.concat(
      twinDeployments.filter(d => !deploymentNodeIds.includes(d.nodeId)),
    );

    // filter deployments on same nodes
    twinDeployments = twinDeployments.filter(d => deploymentNodeIds.includes(d.nodeId));

    await this.reject_update_pubIP_of_oldDeployment(oldDeployments, twinDeployments, name);

    // get twin deployments with/without pub IP
    const filterTwinDeployments = this.filter_pub_and_noPub_deployments(twinDeployments);

    // get old deployments with/without pub IP
    const filterOLdDeployments = this.filter_pub_and_noPub_deployments(oldDeployments);

    finalTwinDeployments = finalTwinDeployments.concat(
      await this._updateWithPubIP(module, name, filterOLdDeployments[0], filterTwinDeployments[0], network),
    );

    finalTwinDeployments = finalTwinDeployments.concat(
      await this._updateWithoutPubIP(module, name, filterOLdDeployments[1], filterTwinDeployments[1], network),
    );

    const contracts = await this.twinDeploymentHandler.handle(finalTwinDeployments);
    if (contracts.created.length === 0 && contracts.updated.length === 0 && contracts.deleted.length === 0) {
      return "Nothing found to update";
    }
    await this.save(name, contracts);
    return { contracts: contracts };
  }

  async _add(
    deployment_name: string,
    node_id: number,
    oldDeployments: Deployment[],
    twinDeployments: TwinDeployment[],
    network: Network = null,
  ) {
    const finalTwinDeployments: TwinDeployment[] = twinDeployments.filter(d => d.operation === Operations.update);
    const twinDeployment: TwinDeployment = twinDeployments.pop();
    const contract_id = await this._getContractIdFromNodeId(deployment_name, node_id);
    if (contract_id && twinDeployment.publicIps == 0) {
      for (let oldDeployment of oldDeployments) {
        oldDeployment = await this.deploymentFactory.fromObj(oldDeployment);
        if (oldDeployment.contract_id !== contract_id) {
          continue;
        }
        if (
          oldDeployment.workloads.filter(
            workload =>
              (workload.type === WorkloadTypes.ip && workload.data["v4"]) || workload.type === WorkloadTypes.network,
          ).length > 0
        ) {
          continue;
        }
        const newDeployment = await this.deploymentFactory.fromObj(oldDeployment);
        newDeployment.workloads = newDeployment.workloads.concat(twinDeployment.deployment.workloads);
        const deployment = await this.deploymentFactory.UpdateDeployment(oldDeployment, newDeployment, network);
        twinDeployment.deployment = deployment;
        twinDeployment.operation = Operations.update;
        break;
      }
    }
    // pop and push the network deployment first before push the added machine to the list
    const networkTwinDeployment = twinDeployments.pop();
    if (networkTwinDeployment) {
      finalTwinDeployments.push(networkTwinDeployment);
    }
    finalTwinDeployments.push(twinDeployment);
    const contracts = await this.twinDeploymentHandler.handle(finalTwinDeployments);
    await this.save(deployment_name, contracts);
    return { contracts: contracts };
  }

  async _deleteInstance(module: KubernetesHL | ZdbHL | VMHL, deployment_name: string, name: string) {
    const deployments = await this._get(deployment_name);
    for (const deployment of deployments) {
      const twinDeployments = await module.delete(deployment, [name]);
      const contracts = await this.twinDeploymentHandler.handle(twinDeployments);
      if (contracts["deleted"].length > 0 || contracts["updated"].length > 0) {
        await this.save(deployment_name, contracts);
        await this._get(deployment_name);
        return contracts;
      }
    }
    throw new ValidationError(`Instance with name ${name} is not found.`);
  }

  async _delete(name: string) {
    const contracts = { created: [], deleted: [], updated: [] };
    if (!(await this._list()).includes(name)) {
      return contracts;
    }
    const deployments = await this._get(name);
    const highlvl = new HighLevelBase(this.config);
    for (const deployment of deployments) {
      const twinDeployments = await highlvl._delete(deployment, []);
      const contract = await this.twinDeploymentHandler.handle(twinDeployments);
      contracts.deleted = contracts.deleted.concat(contract["deleted"]);
      contracts.updated = contracts.updated.concat(contract["updated"]);
    }
    const deletedContracts = [];
    for (const c of contracts.deleted) {
      deletedContracts.push(c["contractId"]);
    }
    const updatedContracts = [];
    for (const c of contracts.updated) {
      if (!deletedContracts.includes(c["contractId"])) {
        updatedContracts.push(c);
      }
    }
    contracts.updated = updatedContracts;
    await this.save(name, contracts);
    return contracts;
  }
}
export { BaseModule };
