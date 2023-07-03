import {
  AddMachineModel,
  DeleteMachineModel,
  DiskModel,
  events,
  type FilterOptions,
  type GridClient,
  MachineModel,
  MachinesModel,
  QSFSDiskModel,
  randomChoice,
} from "@threefold/grid_client";

import { generateName } from "../utils/strings";
import { createNetwork, type Network } from "./deploy_helpers";
import { getWireguardConfig } from "./load_deployment";
import { NodePicker } from "./node_picker";

export async function deployVM(grid: GridClient, options: DeployVMOptions) {
  events.emit("logs", "Finding a suitable node to deploy on.");
  const nodePicker = new NodePicker();
  const vms = new MachinesModel();
  vms.name = options.name;
  vms.network = createNetwork(options.network);
  vms.machines = await Promise.all(options.machines.map(machine => createMachine(grid, machine, nodePicker)));
  vms.metadata = options.metadata;
  vms.description = options.description;
  await grid.machines.deploy(vms);
  return loadVM(grid, vms.name);
}

export async function loadVM(grid: GridClient, name: string) {
  const vm = (await grid.machines.getObj(name)) as any;
  vm.deploymentName = name;
  const wireguard = await getWireguardConfig(grid, vm[0].interfaces[0].network).catch(() => []);
  vm.wireguard = wireguard[0];
  return vm;
}

async function createMachine(grid: GridClient, machine: Machine, nodePicker: NodePicker): Promise<MachineModel> {
  const filters: FilterOptions = {
    cru: machine.cpu,
    mru: Math.round(machine.memory / 1024),
    country: machine.country,
    farmId: machine.farmId,
    farmName: machine.farmName,
    hru: machine.qsfsDisks?.reduce((total, disk) => total + disk.cache, 0),
    sru: machine.disks?.reduce((total, disk) => total + disk.size, machine.rootFilesystemSize || 0),
    publicIPs: machine.publicIpv4,
    availableFor: grid.twinId,
    hasGPU: machine.hasGPU,
    rentedBy: machine.hasGPU ? grid.twinId : undefined,
  };

  const vm = new MachineModel();
  vm.name = machine.name;
  if (machine.nodeId && machine.hasGPU) {
    vm.node_id = machine.nodeId;
  } else {
    //TODO: Remove this condition once this issue is resolved https://github.com/threefoldtech/tfgrid-sdk-ts/issues/703
    filters.farmId = machine.farmId;
    filters.farmName = machine.farmName;

    vm.node_id = await nodePicker.pick(await grid.capacity.filterNodes(filters));
  }

  vm.disks = createDisks(machine.disks);
  vm.gpus = machine.gpus;
  vm.public_ip = machine.publicIpv4 || false;
  vm.public_ip6 = machine.publicIpv6 || false;
  vm.planetary = machine.planetary ?? true;
  vm.cpu = machine.cpu;
  vm.memory = machine.memory;
  vm.rootfs_size = machine.rootFilesystemSize || 0;
  vm.flist = machine.flist;
  vm.entrypoint = machine.entryPoint;
  vm.env = createEnvs(machine.envs);
  vm.solutionProviderId = +process.env.INTERNAL_SOLUTION_PROVIDER_ID!;
  vm.qsfs_disks = createQsfsDisks(machine.qsfsDisks);
  return vm;
}

function createQsfsDisks(disks: QsfsDisk[] = []): QSFSDiskModel[] {
  return disks.map(disk => {
    const qsfs = new QSFSDiskModel();
    qsfs.name = disk.name;
    qsfs.cache = disk.cache;
    qsfs.mountpoint = disk.mountpoint;
    qsfs.encryption_key = disk.encryption_key || disk.name;
    qsfs.prefix = disk.prefix || disk.name;
    qsfs.qsfs_zdbs_name = disk.zdbsName || disk.name;
    return qsfs;
  });
}

function createEnvs(envs: Env[] = []): { [key: string]: string } {
  return envs.reduce((result, env) => {
    result[env.key] = env.value;
    return result;
  }, {} as { [key: string]: string });
}

function createDisks(disks: Disk[] = []): DiskModel[] {
  return disks.map(disk => {
    const d = new DiskModel();
    d.name = disk.name || generateName(7, { prefix: "disk" });
    d.size = disk.size;
    d.mountpoint = disk.mountPoint;
    return d;
  });
}

export interface Env {
  key: string;
  value: string;
}

export interface Disk {
  name?: string;
  size: number;
  mountPoint: string;
}

export interface QsfsDisk {
  name: string;
  cache: number;
  mountpoint: string;
  encryption_key?: string;
  prefix?: string;
  zdbsName?: string;
}

export interface Machine {
  name: string;
  farmId?: number;
  farmName?: string;
  publicIpv4?: boolean;
  publicIpv6?: boolean;
  planetary?: boolean;
  cpu: number;
  memory: number;
  rootFilesystemSize?: number;
  flist: string;
  entryPoint: string;
  envs?: Env[];
  disks?: Disk[];
  country?: string;
  qsfsDisks?: QsfsDisk[];
  hasGPU?: boolean;
  nodeId?: number;
  gpus?: string[];
}

export interface DeployVMOptions {
  name: string;
  network?: Network;
  machines: Machine[];
  metadata?: string;
  description?: string;
}

export type AddMachineOptions = Machine & { deploymentName: string };

export async function addMachine(grid: GridClient, options: AddMachineOptions) {
  const filters: FilterOptions = {
    cru: options.cpu,
    mru: Math.round(options.memory / 1024),
    country: options.country,
    farmId: options.farmId,
    farmName: options.farmName,
    hru: options.qsfsDisks?.reduce((total, disk) => total + disk.cache, 0),
    sru: options.disks?.reduce((total, disk) => total + disk.size, options.rootFilesystemSize || 0),
    publicIPs: options.publicIpv4,
    availableFor: grid.twinId,
    hasGPU: options.hasGPU,
    rentedBy: options.hasGPU ? grid.twinId : undefined,
  };

  const machine = new AddMachineModel();
  machine.deployment_name = options.deploymentName;
  machine.cpu = options.cpu;
  machine.memory = options.memory;
  machine.disks = createDisks(options.disks);
  machine.node_id = +randomChoice(await grid.capacity.filterNodes(filters)).nodeId;
  machine.public_ip = options.publicIpv4 || false;
  machine.public_ip6 = options.publicIpv6 || false;
  machine.name = options.name;
  machine.planetary = options.planetary || true;
  machine.flist = options.flist;
  machine.entrypoint = options.entryPoint;
  machine.qsfs_disks = createQsfsDisks(options.qsfsDisks);
  machine.rootfs_size = options.rootFilesystemSize || 0;
  machine.env = createEnvs(options.envs);
  machine.solutionProviderId = +process.env.INTERNAL_SOLUTION_PROVIDER_ID!;

  await grid.machines.add_machine(machine);
  return loadVM(grid, options.deploymentName);
}

export interface DeleteMachineOptions {
  deploymentName: string;
  name: string;
}
export async function deleteMachine(grid: GridClient, options: DeleteMachineOptions) {
  const machine = new DeleteMachineModel();
  machine.deployment_name = options.deploymentName;
  machine.name = options.name;

  const deletedMachine = await grid.machines.delete_machine(machine);

  if (!deletedMachine.deleted && !deletedMachine.updated) {
    throw new Error("Failed to delete machine");
  }

  return deletedMachine;
}
