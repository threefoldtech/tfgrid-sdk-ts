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
  balance: BigInt;
  historicalBalances: HistoricalBalance[];
}

export interface HistoricalBalance {
  id: ID;
  account: Account;
  balance: BigInt;
  timestamp: BigInt;
}

export interface BurnTransaction {
  id: ID;
  block: Int;
  amount: BigInt;
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
  contractID: BigInt;
  discountReceived: DiscountLevel;
  amountBilled: BigInt;
  timestamp: BigInt;
}

export interface ContractResources {
  id: ID;
  contract: NodeContract;
  hru: BigInt;
  sru: BigInt;
  cru: BigInt;
  mru: BigInt;
}

export interface NodeContract {
  id: ID;
  gridVersion: Int;
  contractID: BigInt;
  twinID: Int;
  nodeID: Int;
  deploymentData: string;
  deploymentHash: string;
  numberOfPublicIPs: Int;
  state: ContractState;
  resourcesUsed?: ContractResources;
  createdAt: BigInt;
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
  contractId: BigInt;
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
  uptime?: BigInt;
  created: Int;
  farmingPolicyId: Int;
  interfaces: Interfaces[];
  certification?: NodeCertification;
  secure?: boolean;
  virtualized?: boolean;
  serialNumber?: string;
  createdAt: BigInt;
  updatedAt: BigInt;
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
  hru: BigInt;
  sru: BigInt;
  cru: BigInt;
  mru: BigInt;
}

export interface MintTransaction {
  id: ID;
  amount: BigInt;
  target: string;
  block: Int;
}

export interface NameContract {
  id: ID;
  gridVersion: Int;
  contractID: BigInt;
  twinID: Int;
  name: string;
  state: ContractState;
  createdAt: BigInt;
  solutionProviderID?: Int;
}

export interface NruConsumption {
  id: ID;
  contractID: BigInt;
  timestamp: BigInt;
  window?: BigInt;
  nru?: BigInt;
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
  amount: BigInt;
  target: string;
  txHash: string;
}

export interface RentContract {
  id: ID;
  gridVersion: Int;
  contractID: BigInt;
  twinID: Int;
  nodeID: Int;
  state: ContractState;
  createdAt: BigInt;
  solutionProviderID?: Int;
}

export interface SolutionProvider {
  id: ID;
  solutionProviderID: BigInt;
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
  amount: BigInt;
  timestamp: BigInt;
}

export interface UptimeEvent {
  id: ID;
  nodeID: Int;
  uptime: BigInt;
  timestamp: BigInt;
}
