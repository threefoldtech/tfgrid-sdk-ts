import { type Consumption, ContractStates, type DiscountLevel, type GridClient } from "@threefold/grid_client";
import { NodeStatus } from "@threefold/gridproxy_client";
import type { Ref } from "vue";

import { gridProxyClient } from "@/clients";
import { solutionType, type VDataTableHeader } from "@/types";

import { normalizeBalance } from "./helpers";

// Cache to store results of `getNodeInfo` requests
const NODE_INFO_CACHE: { [key: number]: { status: NodeStatus; farmId: number } } = {};

export async function getUserContracts(grid: GridClient) {
  const res: any = await grid!.contracts.listMyContracts();

  const promises = [
    ...res.nameContracts.map((c: any) => normalizeContract(grid!, c, ContractType.Name)),
    ...res.nodeContracts.map((c: any) => normalizeContract(grid!, c, ContractType.Node)),
    ...res.rentContracts.map((c: any) => normalizeContract(grid!, c, ContractType.Rent)),
  ];

  return Promise.allSettled(promises).then(results =>
    results.flatMap(result => (result.status === "fulfilled" ? result.value : [])),
  );
}

function parseProjectName(projectName: string) {
  const parts = projectName.split("/");
  if (parts.length) {
    projectName = solutionType[parts[0]];
  }
  return projectName;
}

export async function normalizeContract(
  grid: GridClient,
  c: { [key: string]: any },
  type: ContractType,
): Promise<NormalizedContract> {
  const id = +c.contract_id;

  let data: { [key: string]: string };
  try {
    data = JSON.parse(c.details.deployment_data);
    data.projectName = parseProjectName(data.projectName);
  } catch {
    data = { name: c.details.name };
  }

  let expiration = "-";
  if (c.state === ContractStates.GracePeriod) {
    const exp = await grid.contracts.getDeletionTime({ id });
    expiration = new Date(exp).toLocaleString();
  }

  let consumption: Consumption;
  try {
    consumption = await grid.contracts.getConsumptionWithEstimation({ id });
  } catch {
    consumption = { amountBilled: 0, discountReceived: "None", inFirstBillingCycle: false };
  }

  return {
    contract_id: id,
    twin_id: c.twin_id,
    type,
    deploymentType: data.type,
    state: c.state,
    created_at: c.created_at,
    details: {
      nodeId: c.details.nodeId || "-",
      deployment_data: c.details.deployment_data ? JSON.parse(c.details.deployment_data) : undefined,
      farm_id: c.details.farm_id || "-",
    },
    solutionName: data.name || "-",
    solutionType: data.projectName || data.type || "-",
    expiration,
    consumption: consumption.amountBilled,
    discountPackage: consumption.discountReceived,
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

export async function getNodeInfo(nodeIDs: number[], requestedNodes: number[]) {
  // Ensure we have unique node IDs
  const uniqueNodeIDs = Array.from(new Set(nodeIDs));
  const uniqueRequestedNodes = new Set(requestedNodes);

  const nodeIDsToRequest = uniqueNodeIDs.filter(
    nodeId => !uniqueRequestedNodes.has(nodeId) && !NODE_INFO_CACHE[nodeId],
  );

  const resultPromises = nodeIDsToRequest.map(async nodeId => {
    if (typeof nodeId !== "number") return {};
    const nodeInfo = await gridProxyClient.nodes.byId(nodeId);
    // Store result in cache
    NODE_INFO_CACHE[nodeId] = { status: nodeInfo.status, farmId: nodeInfo.farmId };
    return { [nodeId]: NODE_INFO_CACHE[nodeId] };
  });

  const resultsArray = await Promise.all(resultPromises);
  const results = resultsArray.reduce((acc, obj) => Object.assign(acc, obj), {});

  for (const nodeId of uniqueNodeIDs) {
    if (NODE_INFO_CACHE[nodeId]) {
      results[nodeId] = NODE_INFO_CACHE[nodeId];
    }
  }

  return results;
}

export interface ContractDetails {
  nodeId: number;
  deployment_data?: string;
  deployment_hash?: string;
  number_of_public_ips?: number;
  farm_id: number;
}
export interface DeploymentContract {
  billing: string; // e.g., "0.225 TFT/hour"
  capacity: Capacity;
  contractId: number;
  corex: boolean;
  created: number;
  deploymentName: string;
  description: string;
  entrypoint: string;
  env: EnvVariables;
  flist: string;
  gpu: any[];
  interfaces: DeploymentInterface[];
  message: string;
  metadata: string;
  mounts: any[];
  myceliumIP: string;
  name: string;
  nodeId: number;
  planetary?: any;
  projectName: string;
  publicIP: any | null;
  rootfs_size: number;
  status: string;
  type: string;
  version: number;
}

interface Capacity {
  cpu: number;
  memory: number;
}

interface EnvVariables {
  SSH_KEY: string;
}

interface DeploymentInterface {
  network: string;
  ip: string;
}
export interface NormalizedContract {
  contract_id: number;
  twin_id: number;
  state: ContractStates;
  created_at: number;
  type: "name" | "node" | "rent";
  details: ContractDetails;
  consumption?: number;
  solutionType?: string;
  solutionName?: string;
  deploymentType?: string;
  expiration?: string;
  discountPackage?: DiscountLevel;
}

export enum ContractType {
  Node = "node",
  Rent = "rent",
  Name = "name",
}

export type ContractsTableType = {
  headers: VDataTableHeader;
  type: ContractType;
  icon: string;
  title: string;
  grid: GridClient;
  contracts: Ref<NormalizedContract[]>;
  loading: Ref<boolean>;
  count: Ref<number>;
  page: Ref<number>;
  size: Ref<number>;
};
