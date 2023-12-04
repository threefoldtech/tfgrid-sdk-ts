import {
  ContractStates,
  type GqlNameContract,
  type GqlNodeContract,
  type GqlRentContract,
  GridClient,
} from "@threefold/grid_client";
import { NodeStatus } from "@threefold/gridproxy_client";

import { gridProxyClient } from "@/clients";

import { normalizeBalance } from "./helpers";

export type GqlNameContractWrapper = GqlNameContract & { consumption?: number; expiration?: string };
export type GqlNodeContractWrapper = GqlNodeContract & {
  nodeStatus?: NodeStatus;
  consumption?: number;
  contractId?: number;
  solutionName?: string;
  solutionType?: string;
  expiration?: string;
};

/**
 * Retrieves the status of each node contract and assigns it to the `nodeStatus` property of the contract.
 * @param contracts - An array of `GqlNodeContract` objects representing node contracts.
 * @returns An array of `GqlNodeContractWrapper` objects with the `nodeStatus` property updated for each contract.
 */
async function nameContrctWrapper(
  contracts: GqlNameContractWrapper[],
  grid: GridClient,
): Promise<GqlNameContractWrapper[]> {
  let consumption: number;

  for (const contract of contracts) {
    const id = +contract.contractID;
    try {
      consumption = await grid.contracts.getConsumption({ id });
    } catch {
      consumption = 0;
    }

    let expiration = "-";
    if (contract.state === ContractStates.GracePeriod) {
      const exp = await grid.contracts.getDeletionTime({ id });
      expiration = new Date(exp).toLocaleString();
    }

    contract.consumption = consumption;
    contract.expiration = expiration;
    contract.createdAt = new Date(+contract.createdAt * 1000).toLocaleString();
  }

  console.log("Name contracts: ", contracts);
  return contracts;
}

/**
 * Retrieves the status of each node contract and assigns it to the `nodeStatus` property of the contract.
 * @param contracts - An array of `GqlNodeContract` objects representing node contracts.
 * @returns An array of `GqlNodeContractWrapper` objects with the `nodeStatus` property updated for each contract.
 */
async function nodeContrctWrapper(
  contracts: GqlNodeContractWrapper[],
  grid: GridClient,
): Promise<GqlNodeContractWrapper[]> {
  let data: { [key: string]: string };
  let consumption: number;

  for (const contract of contracts) {
    data = JSON.parse(contract.deploymentData);
    const id = +contract.contractID;
    try {
      consumption = await grid.contracts.getConsumption({ id });
    } catch {
      consumption = 0;
    }

    let expiration = "-";
    if (contract.state === ContractStates.GracePeriod) {
      const exp = await grid.contracts.getDeletionTime({ id });
      expiration = new Date(exp).toLocaleString();
    }

    const status = (await gridProxyClient.nodes.byId(contract.nodeID)).status;
    contract.nodeStatus = status;
    contract.consumption = consumption;
    contract.solutionName = data.name;
    contract.contractId = id;
    contract.expiration = expiration;
    contract.createdAt = new Date(+contract.createdAt * 1000).toLocaleString();
    contract.solutionType = data.projectName || data.type;
  }

  console.log("Node contracts: ", contracts);
  return contracts;
}

/**
 * Normalizes an array of contracts based on the contract type.
 * @param contracts - An array of contracts.
 * @param type - The contract type.
 * @returns A Promise that resolves to an array of normalized contracts.
 */
export async function normalizeContracts(
  contracts: GqlContractType[],
  grid: GridClient,
  type: ContractType,
): Promise<GqlContractType[]> {
  switch (type) {
    case ContractType.NODE:
      return await nodeContrctWrapper(contracts as GqlNodeContractWrapper[], grid);
    case ContractType.NAME:
      return await nameContrctWrapper(contracts as GqlNameContractWrapper[], grid);
    case ContractType.RENT:
      return contracts;
    default:
      throw new Error("Invalid contract type");
  }
}

/**
 * Determines the color associated with a given contract state.
 * @param state - The contract state for which the color needs to be determined.
 * @returns A string representing the color associated with the given contract state.
 * @throws {Error} If the contract state is invalid.
 */
export function getStateColor(state: ContractStates): string {
  switch (state) {
    case ContractStates.Created:
      return "success";
    case ContractStates.Deleted:
      return "error";
    case ContractStates.GracePeriod:
      return "warning";
    case ContractStates.OutOfFunds:
      return "info";
  }
}

export function getNodeStateColor(state: NodeStatus): string {
  switch (state) {
    case NodeStatus.Up:
      return "success";
    case NodeStatus.Down:
      return "error";
    case NodeStatus.Standby:
      return "warning";
  }
}

// export async function normalizeContract(
//   grid: GridClient,
//   c: { [key: string]: any },
//   type: "name" | "node" | "rent",
// ): Promise<NormalizedContract> {
//   let nodeStatus;
//   const id = +c.contractID;
//   const nodeId = c.nodeID;

//   console.log("nodeId: ", nodeId);
//   if (nodeId) {

//   }

//   let consumption: number;
//   try {
//     consumption = await grid.contracts.getConsumption({ id });
//   } catch {
//     consumption = 0;
//   }

//   return {
//     contractId: id,
//     twinID: c.twinID,
//     type,
//     state: c.state,
//     createdAt: new Date(+c.createdAt * 1000).toLocaleString(),
//     nodeId: c.nodeID || "-",
//     solutionProviderID: c.solutionProviderID,

//     expiration,
//     consumption,
//     nodeStatus,
//   };
// }

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
  nodeStatus?: string;
  consumption: number;
  solutionProviderID: number;
  twinID: number;
}

export enum ContractType {
  NODE = "node",
  RENT = "rent",
  NAME = "name",
}

export type GqlContractType = GqlNodeContract | GqlNameContract | GqlRentContract;
