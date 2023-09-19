import { FitType, ID, PartialBoolean } from "../types";
import type { ListQueries } from "./list_queries";

export const BY_ID_QUERIES = {
  nodes: "nodeById",
  accounts: "accountById",
  burnTransactions: "burnTransactionById",
  cities: "cityById",
  contractBillReports: "contractBillReportById",
  contractResources: "contractResourcesById",
  countries: "countryById",
  entityProofs: "entityProofById",
  farmingPolicies: "farmingPolicyById",
  farms: "farmById",
  historicalBalances: "historicalBalanceById",
  interfaces: "interfacesById",
  locations: "locationById",
  mintTransactions: "mintTransactionById",
  nameContracts: "nameContractById",
  nodeContracts: "nodeContractById",
  nodeResourcesTotals: "nodeResourcesTotalById",
  nruConsumptions: "nruConsumptionById",
  pricingPolicies: "pricingPolicyById",
  publicConfigs: "publicConfigById",
  publicIps: "publicIpById",
  refundTransactions: "refundTransactionById",
  rentContracts: "rentContractById",
  solutionProviders: "solutionProviderById",
  transfers: "transferById",
  twins: "twinById",
  uptimeEvents: "uptimeEventById",
} as const;

export type ByIdQueries = {
  [K in keyof ListQueries as K extends keyof typeof BY_ID_QUERIES ? (typeof BY_ID_QUERIES)[K] : K]: <
    T extends PartialBoolean<ReturnType<ListQueries[K]> extends Promise<Array<infer Q>> ? Q : unknown>,
  >(
    id: ID,
    fields: T,
  ) => ReturnType<ListQueries[K]> extends Promise<Array<infer Q>> ? Promise<FitType<T, Q>> : Promise<unknown>;
};
