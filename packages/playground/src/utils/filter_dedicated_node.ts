import type { FilterOptions, GridClient, NodeInfo } from "@threefold/grid_client";

import type { DeployVMOptions } from "./deploy_vm";

export interface Node {
  nodeId: number;
}

export default class DedicatedNode {
  private grid;

  constructor(grid: GridClient) {
    this.grid = grid;
  }

  async getDedicatedNodes(options: DeployVMOptions): Promise<NodeInfo[][]> {
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
          dedicated: machine.dedicated,
          rentedBy: this.grid.twinId,
        };
        return await this.grid.capacity.filterNodes(filters);
      }),
    );
    return nodes;
  }
}
