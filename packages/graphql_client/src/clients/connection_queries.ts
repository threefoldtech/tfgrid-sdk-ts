import { FitType, Int, PartialBoolean } from "../types";
import { ByArray } from "./abstract_client";
import { ListQueries } from "./list_queries";

export const CONNECTION_QUERIES = {
  nodes: "nodesConnection",
  accounts: "accountsConnection",
  burnTransactions: "burnTransactionsConnection",
  cities: "citiesConnection",
  contractBillReports: "contractBillReportsConnection",
  contractResources: "contractResourcesConnection",
  countries: "countriesConnection",
  entityProofs: "entityProofsConnection",
  farmingPolicies: "farmingPoliciesConnection",
  farms: "farmsConnection",
  historicalBalances: "historicalBalancesConnection",
  interfaces: "interfacesConnection",
  locations: "locationsConnection",
  mintTransactions: "mintTransactionsConnection",
  nameContracts: "nameContractsConnection",
  nodeContracts: "nodeContractsConnection",
  nodeResourcesTotals: "nodeResourcesTotalsConnection",
  nruConsumptions: "nruConsumptionsConnection",
  pricingPolicies: "pricingPoliciesConnection",
  publicConfigs: "publicConfigsConnection",
  publicIps: "publicIpsConnection",
  refundTransactions: "refundTransactionsConnection",
  rentContracts: "rentContractsConnection",
  solutionProviders: "solutionProvidersConnection",
  transfers: "transfersConnection",
  twins: "twinsConnection",
  uptimeEvents: "uptimeEventsConnection",
} as const;

export const CONNECTION_ENTITY_QUERIES = {
  nodesConnection: "Node",
  accountsConnection: "Account",
  burnTransactionsConnection: "BurnTransaction",
  citiesConnection: "City",
  contractBillReportsConnection: "ContractBillReport",
  contractResourcesConnection: "ContractResources",
  countriesConnection: "Country",
  entityProofsConnection: "EntityProof",
  farmingPoliciesConnection: "FarmingPolicy",
  farmsConnection: "Farm",
  historicalBalancesConnection: "HistoricalBalance",
  interfacesConnection: "Interfaces",
  locationsConnection: "Location",
  mintTransactionsConnection: "MintTransaction",
  nameContractsConnection: "NameContract",
  nodeContractsConnection: "NodeContract",
  nodeResourcesTotalsConnection: "NodeResourcesTotal",
  nruConsumptionsConnection: "NruConsumption",
  pricingPoliciesConnection: "PricingPolicy",
  publicConfigsConnection: "PublicConfig",
  publicIpsConnection: "PublicIp",
  refundTransactionsConnection: "RefundTransaction",
  rentContractsConnection: "RentContract",
  solutionProvidersConnection: "SolutionProvider",
  transfersConnection: "Transfer",
  twinsConnection: "Twin",
  uptimeEventsConnection: "UptimeEvent",
} as const;

interface __Connection<T> {
  edges: {
    node: T;
    cursor: string;
  };
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string;
    endCursor: string;
  };
  totalCount: Int;
}

type __ConnectionOptions<O extends string, W> = {
  after?: string;
  first?: Int;
  orderBy: `${O}_${"ASC" | "DESC"}`[];
  where?: W;
};

type G<T> = T extends ByArray<infer O, infer W> ? __ConnectionOptions<O, W> : undefined;

export type ConnectionQueries = {
  [K in keyof ListQueries as K extends keyof typeof CONNECTION_QUERIES ? (typeof CONNECTION_QUERIES)[K] : K]: <
    T extends PartialBoolean<__Connection<ReturnType<ListQueries[K]> extends Promise<Array<infer Q>> ? Q : unknown>>,
  >(
    fields: T,
    options: G<Parameters<ListQueries[K]>[1]>,
  ) => Promise<FitType<T, __Connection<ReturnType<ListQueries[K]> extends Promise<Array<infer Q>> ? Q : unknown>>>;
};
