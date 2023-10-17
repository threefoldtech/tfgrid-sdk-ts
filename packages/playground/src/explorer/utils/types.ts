import { CertificationType, type GridNode, type NodeStats, NodeStatus } from "@threefold/gridproxy_client";
import { capitalize } from "vue";

import type { AsyncRule, SyncRule } from "../../components/input_validator.vue";

export type NodeInputFilterType = {
  label: string;
  placeholder: string;
  value?: string | undefined;
  rules?: [syncRules: SyncRule[], asyncRules?: AsyncRule[]];
  error?: string;
  type: string;
};

// The input filters<nodeId, farmIds..etc> and the option filters<status, gpu...etc>
export type MixedFilter = {
  inputs: FilterInputs;
  options: FilterOptions;
};

// Status, GPU, Gateway, and any other option should be add here.
export type FilterOptions = {
  status: NodeStatus;
  gpu: boolean | undefined;
  gateway: boolean | undefined;
  page: number;
  size: number;
};

// Input fields
export type FilterInputs = {
  nodeId: NodeInputFilterType;
  farmIds: NodeInputFilterType;
  farmName: NodeInputFilterType;
  country: NodeInputFilterType;
  freeSru: NodeInputFilterType;
  freeHru: NodeInputFilterType;
  freeMru: NodeInputFilterType;
};

export const optionsInitializer: FilterOptions = {
  gateway: undefined,
  gpu: undefined,
  page: 1,
  size: 10,
  status: capitalize(NodeStatus.Up) as NodeStatus,
};

export type ResourceWrapper = {
  name: string;
  value: string;
};

export type NodeDetailsCard = {
  name: string;
  value?: string;
  imgSrc?: string;
  hint?: string;
  icon?: string;
  callback?: (value: string) => void;
  nameHint?: string; // v-chip hint beside the item name.
  nameHintColor?: string; // The v-chip color
};

export type GridProxyRequestConfig = {
  loadFarm?: boolean;
  loadTwin?: boolean;
  loadStats?: boolean;
  loadGpu?: boolean;
};

export type NodeStatusColor = {
  color: string;
  status: string;
};

export const nodeStatsInitializer: NodeStats = {
  system: { cru: 0, hru: 0, ipv4u: 0, mru: 0, sru: 0 },
  total: { cru: 0, hru: 0, ipv4u: 0, mru: 0, sru: 0 },
  used: { cru: 0, hru: 0, ipv4u: 0, mru: 0, sru: 0 },
  users: {
    deployments: 0,
    workloads: 0,
  },
};

export const nodeInitializer: GridNode = {
  id: "",
  nodeId: 0,
  farmId: 0,
  twinId: 0,
  country: "",
  gridVersion: 0,
  city: "",
  uptime: 0,
  created: 0,
  farmingPolicyId: 0,
  updatedAt: 0,
  total_resources: { mru: 0, sru: 0, hru: 0, cru: 0 },
  used_resources: { mru: 0, sru: 0, hru: 0, cru: 0 },
  location: { city: "", country: "", latitude: 0, longitude: 0 },
  publicConfig: { domain: "", gw4: "", ipv6: "", gw6: "", ipv4: "" },
  status: NodeStatus.Up,
  certificationType: CertificationType.Diy,
  dedicated: false,
  rentContractId: 0,
  rentedByTwinId: 0,
  farm: {
    certificationType: CertificationType.Diy,
    dedicated: false,
    farmId: 0,
    name: "",
    pricingPolicyId: 0,
    publicIps: [],
    twinId: 0,
    stellarAddress: "",
  },
  publicIps: { free: 0, total: 0, used: 0 },
  twin: { twinId: 0, accountId: "", publicKey: "", relay: "" },
  stats: nodeStatsInitializer,
  cards: [],
  num_gpu: 0,
};
