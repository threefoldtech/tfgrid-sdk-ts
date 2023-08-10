import { ContractStates, type GridClient } from "@threefold/grid_client";

import { normalizeBalance } from "./helpers";

export async function getUserContracts(grid: GridClient) {
  const res: any = await grid!.contracts.listMyContracts();

  const promises = [
    res.nameContracts.map((c: any) => normalizeContract(grid!, c, "name")),
    res.nodeContracts.map((c: any) => normalizeContract(grid!, c, "node")),
    res.rentContracts.map((c: any) => normalizeContract(grid!, c, "rent")),
  ];

  return Promise.all(promises.flat(1));
}

async function normalizeContract(
  grid: GridClient,
  c: { [key: string]: any },
  type: "name" | "node" | "rent",
): Promise<NormalizedContract> {
  const id = +c.contractID;

  let data: { [key: string]: string };
  try {
    data = JSON.parse(c.deploymentData);
  } catch {
    data = { name: c.name };
  }

  let expiration = "-";
  if (c.state === ContractStates.GracePeriod) {
    const exp = await grid.contracts.getDeletionTime({ id });
    expiration = new Date(exp).toLocaleString();
  }

  let consumption: string;
  try {
    consumption = formatConsumption(await grid.contracts.getConsumption({ id }));
  } catch {
    consumption = formatConsumption(0);
  }

  return {
    contractId: id,
    twinID: c.twinID,
    type,
    state: c.state,
    createdAt: new Date(+c.createdAt * 1000).toLocaleString(),
    nodeId: c.nodeID || "-",
    solutionProviderID: c.solutionProviderID,
    solutionName: data.name || "-",
    solutionType: data.projectName || data.type || "-",
    expiration,
    consumption,
  };
}

export function formatConsumption(value: number): string {
  value = +value;
  if (isNaN(value) || value <= 0) return "No Data Available";
  return normalizeBalance(value) + " TFT/hour";
}

export interface NormalizedContract {
  contractId: number;
  type: "name" | "node" | "rent";
  state: ContractStates;
  createdAt: string;
  nodeId?: number;
  solutionName?: string;
  solutionType?: string;
  expiration?: string;
  consumption: string;
  solutionProviderID: number;
  twinID: number;
}
