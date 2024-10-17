import { NetworkModel, type ZmachineData } from "@threefold/grid_client";

import { generateName } from "./strings";

export function createNetwork(network: Network = {}): NetworkModel {
  const nw = new NetworkModel();
  nw.name = network.name || generateName({ prefix: "nw" });
  nw.ip_range = network.ipRange || "10.20.0.0/16";
  nw.addAccess = network.addAccess || false;
  nw.accessNodeId = network.accessNodeId;
  return nw;
}

export function setCaproverWorkers(vms: ZmachineData[], projectName: string | undefined = undefined): ZmachineData {
  let leader: any = null;
  const workers: any[] = [];

  vms.forEach((vm: any) => {
    if (vm.env["SWM_NODE_MODE"] === "leader") {
      leader = vm;
    } else if (vm.env["SWM_NODE_MODE"] === "worker") {
      workers.push(vm);
    }

    if (projectName && leader) {
      vm.projectName = projectName;
      vm.deploymentName = leader.name;
    }
  });

  if (leader) {
    leader.workers = workers;
  }

  return leader as ZmachineData;
}

export interface Network {
  name?: string;
  ipRange?: string;
  addAccess?: boolean;
  accessNodeId?: number;
}
