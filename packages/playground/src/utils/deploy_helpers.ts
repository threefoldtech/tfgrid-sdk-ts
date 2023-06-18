import { NetworkModel } from "@threefold/grid_client";

import { generateName } from "./strings";

export function createNetwork(network: Network = {}): NetworkModel {
  const nw = new NetworkModel();
  nw.name = network.name || generateName(9, { prefix: "nw" });
  nw.ip_range = network.ipRange || "10.20.0.0/16";
  nw.addAccess = network.addAccess || false;
  nw.accessNodeId = network.accessNodeId;
  return nw;
}

export interface Network {
  name?: string;
  ipRange?: string;
  addAccess?: boolean;
  accessNodeId?: number;
}
