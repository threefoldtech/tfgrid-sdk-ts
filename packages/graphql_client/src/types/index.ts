export type ID = number | string;
export type BigInt = number;
export type Int = number;
export type FarmCertification = "NotCertified" | "Gold";
export type NodeCertification = "Diy" | "Certified";
export type DiscountLevel = "None" | "Default" | "Bronze" | "Silver" | "Gold";
export type ContractState = "Created" | "Deleted" | "OutOfFunds" | "GracePeriod";

export type PartialBoolean<T> = {
  [K in keyof T]?: T[K] extends Array<infer Q>
    ? Q extends object
      ? PartialBoolean<Q>
      : true
    : T[K] extends object
    ? PartialBoolean<T[K]>
    : true;
};

type __BaseWhere<T> = { eq: T; not_eq: T; gt: T; gte: T; lt: T; lte: T; in: T[]; not_in: T[]; }; // prettier-ignore
type __StringWhere = "contains" | "not_contains" | "startsWith" | "not_startsWith" | "endsWith" | "not_endsWith"; // prettier-ignore
type __ArrayWhere = "none" | "every" | "some";
type __EnumWhere<T> = { eq: T; not_eq: T; in: T[]; not_in: T[] };
type __BoolWhere = "eq" | "not_eq";
export type AbstractWhere<T> = {
  AND?: AbstractWhere<T>;
  OR?: AbstractWhere<T>;
} & T;

export type BaseWhere<N extends string, T> = {
  [K in keyof __BaseWhere<T> as K extends string ? `${N}_${K}` : K]?: __BaseWhere<T>[K];
};

export type StringWhere<N extends string> = BaseWhere<N, string> & {
  [K in __StringWhere as K extends string ? `${N}_${K}` : K]?: string;
};

export type ArrayWhere<N extends string, T> = {
  [K in __ArrayWhere as K extends string ? `${N}_${K}` : K]?: T;
};

export type NullWhere<N extends string> = {
  [K in N as K extends string ? `${K}_isNull` : K]?: boolean;
};

export type EnumWhere<N extends string, E> = {
  [K in keyof __EnumWhere<E> as K extends string ? `${N}_${K}` : K]?: __EnumWhere<E>[K];
};

export type BoolWhere<N extends string> = {
  [K in __BoolWhere as K extends string ? `${N}_${K}` : K]?: boolean;
};

export type FitType<T, R> = {
  [K in keyof T]: K extends keyof R ? (T[K] extends object ? FitType<T[K], R[K]> : R[K]) : unknown;
};

export interface Account {
  id: ID;
  wallet: string;
  balance: bigint;
  historicalBalances: HistoricalBalance[];
}

export interface HistoricalBalance {
  id: ID;
  account: Account;
  balance: bigint;
  timestamp: bigint;
}

export interface BurnTransaction {
  id: ID;
  block: Int;
  amount: bigint;
  target: string;
}

export interface City {
  id: ID;
  cityID: Int;
  countryID: Int;
  name: string;
}

export interface ContractBillReport {
  id: ID;
  contractID: bigint;
  discountReceived: DiscountLevel;
  amountBilled: bigint;
  timestamp: bigint;
}

export interface ContractResources {
  id: ID;
  contract: NodeContract;
  hru: bigint;
  sru: bigint;
  cru: bigint;
  mru: bigint;
}

export interface NodeContract {
  id: ID;
  gridVersion: Int;
  contractID: bigint;
  twinID: Int;
  nodeID: Int;
  deploymentData: string;
  deploymentHash: string;
  numberOfPublicIPs: Int;
  state: ContractState;
  resourcesUsed?: ContractResources;
  createdAt: bigint;
  solutionProviderID?: Int;
}

export interface Country {
  id: ID;
  countryID: Int;
  code: string;
  name: string;
  region: string;
  subregion: string;
  lat?: string;
  long?: string;
}

export interface Entity {
  id: ID;
  gridVersion: Int;
  entityID: Int;
  name: string;
  country?: string;
  city?: string;
  accountID: string;
}

export interface EntityProof {
  id: ID;
  entityID: Int;
  signature: string;
  twinRel: Twin;
}

export interface Twin {
  id: ID;
  gridVersion: Int;
  twinID: Int;
  accountID: string;
  ip: string;
}

export interface Farm {
  id: ID;
  gridVersion: Int;
  farmID: Int;
  name: string;
  twinID: Int;
  pricingPolicyID: Int;
  certification?: FarmCertification;
  publicIPs: PublicIp[];
  stellarAddress?: string;
  dedicatedFarm?: boolean;
}

export interface PublicIp {
  id: ID;
  farm: Farm;
  gateway: string;
  ip: string;
  contractId: bigint;
}

export interface FarmingPolicy {
  id: ID;
  gridVersion: Int;
  farmingPolicyID: Int;
  name?: string;
  cu?: Int;
  su?: Int;
  nu?: Int;
  ipv4?: Int;
  minimalUptime?: Int;
  policyCreated?: Int;
  policyEnd?: Int;
  immutable?: boolean;
  default?: boolean;
  nodeCertification?: NodeCertification;
  farmCertification?: FarmCertification;
}

export interface Interfaces {
  id: ID;
  node: Node;
  name: string;
  mac: string;
  ips: string;
}

export interface Node {
  id: ID;
  gridVersion: Int;
  nodeID: Int;
  farmID: Int;
  twinID: Int;
  location: Location;
  country?: string;
  city?: string;
  publicConfig?: PublicConfig;
  resourcesTotal?: NodeResourcesTotal;
  uptime?: bigint;
  created: Int;
  farmingPolicyId: Int;
  interfaces: Interfaces[];
  certification?: NodeCertification;
  secure?: boolean;
  virtualized?: boolean;
  serialNumber?: string;
  createdAt: bigint;
  updatedAt: bigint;
  connectionPrice?: Int;
}

export interface Location {
  id: ID;
  longitude: string;
  latitude: string;
}

export interface PublicConfig {
  id: ID;
  node: Node;
  ipv4?: string;
  ipv6?: string;
  gw4?: string;
  gw6?: string;
  domain?: string;
}

export interface NodeResourcesTotal {
  id: ID;
  node: Node;
  hru: bigint;
  sru: bigint;
  cru: bigint;
  mru: bigint;
}

export interface MintTransaction {
  id: ID;
  amount: bigint;
  target: string;
  block: Int;
}

export interface NameContract {
  id: ID;
  gridVersion: Int;
  contractID: bigint;
  twinID: Int;
  name: string;
  state: ContractState;
  createdAt: bigint;
  solutionProviderID?: Int;
}

export interface NruConsumption {
  id: ID;
  contractID: bigint;
  timestamp: bigint;
  window?: bigint;
  nru?: bigint;
}

export interface PricingPolicy {
  id: ID;
  gridVersion: Int;
  pricingPolicyID: Int;
  name: string;
  su: Policy;
  cu: Policy;
  nu: Policy;
  ipu: Policy;
  foundationAccount: string;
  certifiedSalesAccount: string;
  dedicatedNodeDiscount: Int;
}

export interface Policy {
  value?: Int;
  unit?: string;
}

export interface RefundTransaction {
  id: ID;
  block: Int;
  amount: bigint;
  target: string;
  txHash: string;
}

export interface RentContract {
  id: ID;
  gridVersion: Int;
  contractID: bigint;
  twinID: Int;
  nodeID: Int;
  state: ContractState;
  createdAt: bigint;
  solutionProviderID?: Int;
}

export interface SolutionProvider {
  id: ID;
  solutionProviderID: bigint;
  description: string;
  link: string;
  approved: boolean;
  providers?: Array<Provider | undefined>;
}

export interface Provider {
  who: string;
  take: Int;
}

export interface Transfer {
  id: ID;
  from: string;
  to: string;
  amount: bigint;
  timestamp: bigint;
}

export interface UptimeEvent {
  id: ID;
  nodeID: Int;
  uptime: bigint;
  timestamp: bigint;
}
