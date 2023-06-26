import { Addr } from "netaddr";

import { GridClientConfig } from "../config";
import { events } from "../helpers/events";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { VMHL } from "../high_level/machine";
import { TwinDeployment } from "../high_level/models";
import { Network } from "../primitives/network";
import { WorkloadTypes } from "../zos/workload";
import { BaseModule } from "./base";
import { AddMachineModel, DeleteMachineModel, MachinesDeleteModel, MachinesGetModel, MachinesModel } from "./models";
import { checkBalance } from "./utils";

class MachinesModule extends BaseModule {
  moduleName = "machines";
  workloadTypes = [
    WorkloadTypes.zmachine,
    WorkloadTypes.zmount,
    WorkloadTypes.qsfs,
    WorkloadTypes.ip,
    WorkloadTypes.ipv4,
    WorkloadTypes.zlogs,
  ]; // TODO: remove deprecated
  vm: VMHL;
  constructor(public config: GridClientConfig) {
    super(config);
    this.vm = new VMHL(config);
  }

  async _createDeployment(options: MachinesModel): Promise<[TwinDeployment[], Network, string]> {
    const network = new Network(options.network.name, options.network.ip_range, this.config);
    await network.load();

    let twinDeployments: TwinDeployment[] = [];
    let wireguardConfig = "";
    const metadata = JSON.stringify({
      type: "vm",
      name: options.name,
      projectName: this.config.projectName,
    });

    const machines_names: string[] = [];

    for (const machine of options.machines) {
      if (machines_names.includes(machine.name))
        throw Error(`Another machine with the same name ${machine.name} already exists`);
      machines_names.push(machine.name);

      const [TDeployments, wgConfig] = await this.vm.create(
        machine.name,
        machine.node_id,
        machine.flist,
        machine.cpu,
        machine.memory,
        machine.rootfs_size,
        machine.disks!,
        machine.public_ip,
        machine.public_ip6!,
        machine.planetary,
        network,
        machine.entrypoint,
        machine.env,
        options.metadata || metadata,
        options.description,
        machine.qsfs_disks,
        this.config.projectName,
        options.network.addAccess,
        options.network.accessNodeId,
        machine.ip,
        machine.corex,
        machine.solutionProviderId!,
        machine.zlogsOutput,
        machine.gpus,
      );
      twinDeployments = twinDeployments.concat(TDeployments);
      if (wgConfig) {
        wireguardConfig = wgConfig;
      }
    }
    return [twinDeployments, network, wireguardConfig];
  }

  @expose
  @validateInput
  @checkBalance
  async deploy(options: MachinesModel) {
    if (await this.exists(options.name)) {
      throw Error(`Another machine deployment with the same name ${options.name} already exists`);
    }
    events.emit("logs", `Start creating the machine deployment with name ${options.name}`);
    const [twinDeployments, , wireguardConfig] = await this._createDeployment(options);
    const contracts = await this.twinDeploymentHandler.handle(twinDeployments);
    await this.save(options.name, contracts);
    return { contracts: contracts, wireguard_config: wireguardConfig };
  }

  @expose
  async list() {
    return await this._list();
  }

  async getObj(deploymentName: string) {
    const deployments = await this._get(deploymentName);
    const workloads = await this._getWorkloadsByTypes(deploymentName, deployments, [WorkloadTypes.zmachine]);
    const promises = workloads.map(
      async workload => await this._getZmachineData(deploymentName, deployments, workload),
    );
    return await Promise.all(promises);
  }

  @expose
  @validateInput
  async get(options: MachinesGetModel) {
    return await this._get(options.name);
  }

  @expose
  @validateInput
  @checkBalance
  async delete(options: MachinesDeleteModel) {
    events.emit("logs", `Start deleting the machine deployment with name ${options.name}`);
    return await this._delete(options.name);
  }

  @expose
  @validateInput
  @checkBalance
  async update(options: MachinesModel) {
    if (!(await this.exists(options.name))) {
      throw Error(`There is no machine with the name: ${options.name}`);
    }

    const oldDeployments = await this._get(options.name);
    const workload = (await this._getWorkloadsByTypes(options.name, oldDeployments, [WorkloadTypes.zmachine]))[0];
    const networkName = workload.data["network"].interfaces[0].network;
    const networkIpRange = Addr(workload.data["network"].interfaces[0].ip).mask(16).toString();
    if (networkName !== options.network.name || networkIpRange !== options.network.ip_range) {
      throw Error("Network name and ip_range can't be changed");
    }

    const [twinDeployments, network] = await this._createDeployment(options);
    return await this._update(this.vm, options.name, oldDeployments, twinDeployments, network);
  }

  @expose
  @validateInput
  @checkBalance
  async add_machine(options: AddMachineModel) {
    if (!(await this.exists(options.deployment_name))) {
      throw Error(`There are no machine deployments with the name: ${options.deployment_name}`);
    }
    const oldDeployments = await this._get(options.deployment_name);
    if (this.workloadExists(options.name, oldDeployments))
      throw Error(
        `There is another machine with the same name "${options.name}" in the same deployment ${options.deployment_name}`,
      );

    events.emit("logs", `Start adding machine: ${options.name} to deployment: ${options.deployment_name}`);
    const workload = (
      await this._getWorkloadsByTypes(options.deployment_name, oldDeployments, [WorkloadTypes.zmachine])
    )[0];
    const networkName = workload.data["network"].interfaces[0].network;
    const networkIpRange = Addr(workload.data["network"].interfaces[0].ip).mask(16).toString();
    const network = new Network(networkName, networkIpRange, this.config);
    await network.load();

    const [twinDeployments] = await this.vm.create(
      options.name,
      options.node_id,
      options.flist,
      options.cpu,
      options.memory,
      options.rootfs_size,
      options.disks!,
      options.public_ip,
      options.public_ip6!,
      options.planetary,
      network,
      options.entrypoint,
      options.env,
      workload.metadata,
      workload.description,
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
  async delete_machine(options: DeleteMachineModel) {
    if (!(await this.exists(options.deployment_name))) {
      throw Error(`There are no machine deployments with the name: ${options.deployment_name}`);
    }
    events.emit("logs", `Start deleting machine: ${options.name} from deployment: ${options.deployment_name}`);
    return await this._deleteInstance(this.vm, options.deployment_name, options.name);
  }
}

export { MachinesModule as machines };
