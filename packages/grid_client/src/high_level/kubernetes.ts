import { events } from "../helpers/events";
import { VMHL } from "../high_level//machine";
import { QSFSDiskModel } from "../modules/models";
import { Network } from "../primitives/network";
import { Deployment } from "../zos/deployment";
import { WorkloadTypes } from "../zos/workload";
import { HighLevelBase } from "./base";

const Flist = "https://hub.grid.tf/tf-official-apps/threefoldtech-k3s-latest.flist";

class KubernetesHL extends HighLevelBase {
  async add_master(
    name: string,
    nodeId: number,
    secret: string,
    cpu: number,
    memory: number,
    rootfs_size: number,
    diskSize: number,
    publicIp: boolean,
    publicIp6: boolean,
    planetary: boolean,
    network: Network,
    sshKey: string,
    metadata = "",
    description = "",
    qsfs_disks: QSFSDiskModel[] = [],
    qsfsProjectName = "",
    addAccess = false,
    accessNodeId = 0,
    ip = "",
    corex = false,
    solutionProviderId: number,
    zlogsOutput?: string,
    gpus: string[] = [],
  ) {
    events.emit("logs", `Creating a master with name: ${name} on node: ${nodeId}, network: ${network.name}`);
    const machine = new VMHL(this.config);
    const mountpoint = "/mnt/data";
    const env = {
      SSH_KEY: sshKey,
      K3S_TOKEN: secret,
      K3S_DATA_DIR: mountpoint,
      K3S_FLANNEL_IFACE: "eth0",
      K3S_NODE_NAME: name,
      K3S_URL: "",
    };
    const disk = {
      name: `${name}_disk`,
      size: diskSize,
      mountpoint: mountpoint,
    };
    return await machine.create(
      name,
      nodeId,
      Flist,
      cpu,
      memory,
      rootfs_size,
      [disk],
      publicIp,
      publicIp6,
      planetary,
      network,
      "/sbin/zinit init",
      env,
      metadata,
      description,
      qsfs_disks,
      qsfsProjectName,
      addAccess,
      accessNodeId,
      ip,
      corex,
      solutionProviderId,
      zlogsOutput,
      gpus,
    );
  }

  async add_worker(
    name: string,
    nodeId: number,
    secret: string,
    masterIp: string,
    cpu: number,
    memory: number,
    rootfs_size: number,
    diskSize: number,
    publicIp: boolean,
    publicIp6: boolean,
    planetary: boolean,
    network: Network,
    sshKey: string,
    metadata = "",
    description = "",
    qsfs_disks: QSFSDiskModel[] = [],
    qsfsProjectName = "",
    addAccess = false,
    accessNodeId = 0,
    ip = "",
    corex = false,
    solutionProviderId: number,
    zlogsOutput?: string,
    gpus: string[] = [],
  ) {
    events.emit("logs", `Creating a worker with name: ${name} on node: ${nodeId}, network: ${network.name}`);
    const machine = new VMHL(this.config);
    const mountpoint = "/mnt/data";
    const env = {
      SSH_KEY: sshKey,
      K3S_TOKEN: secret,
      K3S_DATA_DIR: mountpoint,
      K3S_FLANNEL_IFACE: "eth0",
      K3S_NODE_NAME: name,
      K3S_URL: `https://${masterIp}:6443`,
    };
    const disk = {
      name: `${name}_disk`,
      size: diskSize,
      mountpoint: mountpoint,
    };
    return await machine.create(
      name,
      nodeId,
      Flist,
      cpu,
      memory,
      rootfs_size,
      [disk],
      publicIp,
      publicIp6,
      planetary,
      network,
      "/sbin/zinit init",
      env,
      metadata,
      description,
      qsfs_disks,
      qsfsProjectName,
      addAccess,
      accessNodeId,
      ip,
      corex,
      solutionProviderId,
      zlogsOutput,
      gpus,
    );
  }

  async delete(deployment: Deployment, names: string[]) {
    return await this._delete(deployment, names, [
      WorkloadTypes.zmachine,
      WorkloadTypes.zmount,
      WorkloadTypes.ip,
      WorkloadTypes.ipv4,
      WorkloadTypes.zlogs,
    ]); // TODO: remove deprecated
  }
}
export { KubernetesHL };
