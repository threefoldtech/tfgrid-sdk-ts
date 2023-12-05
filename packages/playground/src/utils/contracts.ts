import { ContractStates, type GridClient } from "@threefold/grid_client";
import { NodeStatus } from "@threefold/gridproxy_client";
import type { Ref } from "vue";

import { gridProxyClient } from "@/clients";
import type { VDataTableHeader } from "@/types";

import { normalizeBalance } from "./helpers";

export async function getUserContracts(grid: GridClient) {
  const res: any = await grid!.contracts.listMyContracts();

  const promises = [
    ...res.nameContracts.map((c: any) => normalizeContract(grid!, c, ContractType.NAME)),
    ...res.nodeContracts.map((c: any) => normalizeContract(grid!, c, ContractType.NODE)),
    ...res.rentContracts.map((c: any) => normalizeContract(grid!, c, ContractType.RENT)),
  ];

  return Promise.allSettled(promises).then(results =>
    results.flatMap(result => (result.status === "fulfilled" ? result.value : [])),
  );
}

async function normalizeContract(
  grid: GridClient,
  c: { [key: string]: any },
  type: ContractType,
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

  let consumption: number;
  try {
    consumption = await grid.contracts.getConsumption({ id });
  } catch {
    consumption = 0;
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

export function getNodeStateColor(state: NodeStatus): string {
  const colorMap = {
    [NodeStatus.Up]: "success",
    [NodeStatus.Down]: "error",
    [NodeStatus.Standby]: "warning",
  };

  return colorMap[state] || "";
}

export function getStateColor(state: ContractStates): string {
  const stateMap = {
    [ContractStates.Created]: "success",
    [ContractStates.Deleted]: "error",
    [ContractStates.GracePeriod]: "warning",
    [ContractStates.OutOfFunds]: "info",
  };

  return stateMap[state] || "";
}

export function formatConsumption(value: number): string {
  value = +value;
  if (isNaN(value) || value <= 0) return "No Data Available";
  return normalizeBalance(value) + " TFT/hour";
}

export async function getNodeStatus(nodeIDs: (number | undefined)[]) {
  const resultPromises = nodeIDs.map(async nodeId => {
    if (typeof nodeId !== "number") return {};
    const status = (await gridProxyClient.nodes.byId(nodeId)).status;
    return { [nodeId]: status };
  });

  const resultsArray = await Promise.all(resultPromises);

  return resultsArray.reduce((acc, obj) => Object.assign(acc, obj), {});
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
  consumption: number;
  solutionProviderID: number;
  twinID: number;
}

export enum ContractType {
  NODE = "node",
  RENT = "rent",
  NAME = "name",
}

export type ContractsTableType = {
  headers: VDataTableHeader;
  type: ContractType;
  icon: string;
  title: string;
  grid: Ref<GridClient | undefined>;
  contracts: Ref<NormalizedContract[]>;
  loading: Ref<boolean>;
};
