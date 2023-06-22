import type { FilterOptions, GridClient, NodeInfo } from "@threefold/grid_client";

import type { DeployVMOptions } from "./deploy_vm";

export interface NodeGPUCardType {
  id: string;
  vendor: string;
  device: string;
  contract: number;
}

export interface GPUNodeType {
  nodeId: number;
  cards: NodeGPUCardType[];
}

export default class GPUNode {
  private grid;

  constructor(grid: GridClient) {
    this.grid = grid;
  }

  async getNodeCards(nodeId: number): Promise<NodeGPUCardType[]> {
    let cards: NodeGPUCardType[] = [];
    await this.grid.zos
      .getNodeGPUInfo({
        nodeId: nodeId,
      })
      .then(res => (cards = res));
    return cards;
  }

  async getNodes(options: DeployVMOptions): Promise<NodeInfo[][]> {
    // Return a list of nodes that has gpus and rented for the activated user account.
    const nodes = await Promise.all(
      options.machines.map(async machine => {
        const filters: FilterOptions = {
          cru: machine.cpu,
          mru: Math.round(machine.memory / 1024),
          country: machine.country,
          hru: machine.qsfsDisks?.reduce((total, disk) => total + disk.cache, 0),
          sru: machine.disks?.reduce((total, disk) => total + disk.size, machine.rootFilesystemSize || 0),
          publicIPs: machine.publicIpv4,
          availableFor: this.grid.twinId,
          hasGPU: machine.hasGPU,
          rentedBy: machine.rentedBy,
        };
        return await this.grid.capacity.filterNodes(filters);
      }),
    );
    return nodes;
  }
}
