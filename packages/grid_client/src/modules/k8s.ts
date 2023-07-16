import { Addr } from "netaddr";

import { GridClientConfig } from "../config";
import { events } from "../helpers/events";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { KubernetesHL } from "../high_level/kubernetes";
import { TwinDeployment } from "../high_level/models";
import { Network } from "../primitives/network";
import { Workload, WorkloadTypes } from "../zos/workload";
import { BaseModule } from "./base";
import { AddWorkerModel, DeleteWorkerModel, K8SDeleteModel, K8SGetModel, K8SModel } from "./models";
import { checkBalance } from "./utils";

class K8sModule extends BaseModule {
  moduleName = "kubernetes";
  workloadTypes = [
    WorkloadTypes.zmachine,
    WorkloadTypes.zmount,
    WorkloadTypes.qsfs,
    WorkloadTypes.ip,
    WorkloadTypes.ipv4,
    WorkloadTypes.zlogs,
  ]; // TODO: remove deprecated
  kubernetes: KubernetesHL;

  constructor(public config: GridClientConfig) {
    super(config);
    this.kubernetes = new KubernetesHL(config);
  }

  async _getMastersWorkload(deploymentName: string, deployments): Promise<Workload[]> {
    const workloads: Workload[] = [];
    for (const deployment of deployments) {
      let d = deployment;
      if (deployment instanceof TwinDeployment) {
        d = deployment.deployment;
      }
      for (const workload of d.workloads) {
        if (workload.type === WorkloadTypes.zmachine && workload.data["env"]["K3S_URL"] === "") {
          workload["contractId"] = deployment.contract_id;
          workload["nodeId"] = await this._getNodeIdFromContractId(deploymentName, deployment.contract_id);
          workloads.push(workload);
        }
      }
    }
    return workloads;
  }

  async _getWorkersWorkload(deploymentName: string, deployments): Promise<Workload[]> {
    const workloads: Workload[] = [];
    for (const deployment of deployments) {
      let d = deployment;
      if (deployment instanceof TwinDeployment) {
        d = deployment.deployment;
      }
      for (const workload of d.workloads) {
        if (workload.type === WorkloadTypes.zmachine && workload.data["env"]["K3S_URL"] !== "") {
          workload["contractId"] = deployment.contract_id;
          workload["nodeId"] = await this._getNodeIdFromContractId(deploymentName, deployment.contract_id);
          workloads.push(workload);
        }
      }
    }
    return workloads;
  }

  async _getMastersIp(deploymentName: string, deployments): Promise<string[]> {
    const ips: string[] = [];
    const workloads = await this._getMastersWorkload(deploymentName, deployments);
    for (const workload of workloads) {
      ips.push(workload.data["network"]["interfaces"][0]["ip"]);
    }
    return ips;
  }

  async _createDeployment(options: K8SModel, masterIps: string[] = []): Promise<[TwinDeployment[], Network, string]> {
    const network = new Network(options.network.name, options.network.ip_range, this.config);
    await network.load();

    let deployments: TwinDeployment[] = [];
    let wireguardConfig = "";
    const metadata = JSON.stringify({
      type: "kubernetes",
      name: options.name,
      projectName: this.config.projectName,
    });
    const masters_names: string[] = [];
    const workers_names: string[] = [];
    for (const master of options.masters) {
      if (masters_names.includes(master.name))
        throw Error(`Another master with the same name ${master.name} already exists`);
      masters_names.push(master.name);

      const [twinDeployments, wgConfig] = await this.kubernetes.add_master(
        master.name,
        master.node_id,
        options.secret,
        master.cpu,
        master.memory,
        master.rootfs_size,
        master.disk_size,
        master.public_ip,
        master.public_ip6,
        master.planetary,
        network,
        options.ssh_key,
        options.metadata || metadata,
        options.description,
        master.qsfs_disks,
        this.config.projectName,
        options.network.addAccess,
        options.network.accessNodeId,
        master.ip,
        master.corex,
        master.solutionProviderId!,
        master.zlogsOutput,
        master.gpus,
      );

      deployments = deployments.concat(twinDeployments);
      if (wgConfig) {
        wireguardConfig = wgConfig;
      }
    }

    if (masterIps.length === 0) {
      masterIps = await this._getMastersIp(options.name, deployments);
      if (masterIps.length === 0) {
        throw Error("Couldn't get master ip");
      }
    }
    for (const worker of options.workers!) {
      if (workers_names.includes(worker.name))
        throw Error(`Another worker with the same name ${worker.name} already exists`);
      workers_names.push(worker.name);

      const [twinDeployments] = await this.kubernetes.add_worker(
        worker.name,
        worker.node_id,
        options.secret,
        masterIps[masterIps.length - 1],
        worker.cpu,
        worker.memory,
        worker.rootfs_size,
        worker.disk_size,
        worker.public_ip,
        worker.public_ip6,
        worker.planetary,
        network,
        options.ssh_key,
        options.metadata || metadata,
        options.description,
        worker.qsfs_disks,
        this.config.projectName,
        options.network.addAccess,
        options.network.accessNodeId,
        worker.ip,
        worker.corex,
        worker.solutionProviderId!,
        worker.zlogsOutput,
        worker.gpus,
      );

      deployments = deployments.concat(twinDeployments);
    }
    return [deployments, network, wireguardConfig];
  }

  @expose
  @validateInput
  @checkBalance
  async deploy(options: K8SModel) {
    if (options.masters.length > 1) {
      throw Error("Multiple masters are not supported");
    }

    if (await this.exists(options.name)) {
      throw Error(`Another k8s deployment with the same name ${options.name} already exists`);
    }

    events.emit("logs", `Start creating the cluster with name ${options.name}`);
    const [deployments, , wireguardConfig] = await this._createDeployment(options);
    const contracts = await this.twinDeploymentHandler.handle(deployments);
    await this.save(options.name, contracts);
    return { contracts: contracts, wireguard_config: wireguardConfig };
  }

  @expose
  async list() {
    return await this._list();
  }

  async getObj(deploymentName: string) {
    const k = { masters: [], workers: [] };
    const deployments = await this._get(deploymentName);
    const masters = await this._getMastersWorkload(deploymentName, deployments);
    const workers = await this._getWorkersWorkload(deploymentName, deployments);
    for (const master of masters) {
      k.masters.push(await this._getZmachineData(deploymentName, deployments, master));
    }
    for (const worker of workers) {
      k.workers.push(await this._getZmachineData(deploymentName, deployments, worker));
    }
    return k;
  }

  @expose
  @validateInput
  async get(options: K8SGetModel) {
    return await this._get(options.name);
  }

  @expose
  @validateInput
  @checkBalance
  async delete(options: K8SDeleteModel) {
    events.emit("logs", `Start deleting the cluster with name ${options.name}`);
    return await this._delete(options.name);
  }

  @expose
  @validateInput
  @checkBalance
  async update(options: K8SModel) {
    if (!(await this.exists(options.name))) {
      throw Error(`There is no k8s deployment with the name: ${options.name}`);
    }
    if (options.masters.length > 1) {
      throw Error("Multiple masters are not supported");
    }
    const oldDeployments = await this._get(options.name);

    const masterIps = await this._getMastersIp(options.name, oldDeployments);
    if (masterIps.length === 0) {
      throw Error("Couldn't get master ip");
    }
    const masterWorkloads = await this._getMastersWorkload(options.name, oldDeployments);
    if (masterWorkloads.length === 0) {
      throw Error("Couldn't get master node");
    }
    const masterWorkload = masterWorkloads[0];
    const networkName = masterWorkload.data["network"].interfaces[0].network;
    const networkIpRange = Addr(masterWorkload.data["network"].interfaces[0].ip).mask(16).toString();
    if (networkName !== options.network.name && networkIpRange !== options.network.ip_range) {
      throw Error("Network name and ip_range can't be changed");
    }

    //TODO: check that the master nodes are not changed
    const [twinDeployments, network] = await this._createDeployment(options, masterIps);
    return await this._update(this.kubernetes, options.name, oldDeployments, twinDeployments, network);
  }

  @expose
  @validateInput
  @checkBalance
  async add_worker(options: AddWorkerModel) {
    if (!(await this.exists(options.deployment_name))) {
      throw Error(`There is no k8s deployment with the name: ${options.deployment_name}`);
    }
    const oldDeployments = await this._get(options.deployment_name);
    if (this.workloadExists(options.name, oldDeployments))
      throw Error(
        `There is another worker with the same name "${options.name}" in this cluster ${options.deployment_name}`,
      );
    events.emit("logs", `Start adding worker: ${options.name} to cluster: ${options.deployment_name}`);
    const masterWorkloads = await this._getMastersWorkload(options.deployment_name, oldDeployments);
    if (masterWorkloads.length === 0) {
      throw Error("Couldn't get master node");
    }
    const masterWorkload = masterWorkloads[masterWorkloads.length - 1];
    const networkName = masterWorkload.data["network"].interfaces[0].network;
    const networkIpRange = Addr(masterWorkload.data["network"].interfaces[0].ip).mask(16).toString();
    const network = new Network(networkName, networkIpRange, this.config);
    await network.load();
    const [twinDeployments] = await this.kubernetes.add_worker(
      options.name,
      options.node_id,
      masterWorkload.data["env"]["K3S_TOKEN"],
      masterWorkload.data["network"]["interfaces"][0]["ip"],
      options.cpu,
      options.memory,
      options.rootfs_size,
      options.disk_size,
      options.public_ip,
      options.public_ip6,
      options.planetary,
      network,
      masterWorkload.data["env"]["SSH_KEY"],
      masterWorkload.metadata,
      masterWorkload.description,
      options.qsfs_disks,
      this.config.projectName,
      false,
      0,
      options.ip,
      options.corex,
      options.solutionProviderId!,
      options.zlogsOutput,
      options.gpus,
    );

    return await this._add(options.deployment_name, options.node_id, oldDeployments, twinDeployments, network);
  }

  @expose
  @validateInput
  @checkBalance
  async delete_worker(options: DeleteWorkerModel) {
    if (!(await this.exists(options.deployment_name))) {
      throw Error(`There is no k8s deployment with the name: ${options.deployment_name}`);
    }
    events.emit("logs", `Start deleting worker: ${options.name} from cluster: ${options.deployment_name}`);
    return await this._deleteInstance(this.kubernetes, options.deployment_name, options.name);
  }
}

export { K8sModule as k8s };
