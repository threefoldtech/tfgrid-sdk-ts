import { CertificationType, type GridNode, type NodeStats, NodeStatus } from "@threefold/gridproxy_client";
import { capitalize } from "vue";
import type { VDataTable } from "vuetify/lib/labs/components";

import type { AsyncRule, SyncRule } from "@/components/input_validator.vue";
import type { INode } from "@/utils/filter_nodes";

import type * as validators from "../utils/validators";
// Input attrs
export type InputFilterType = {
  label: string;
  placeholder: string;
  value?: string;
  rules?: [syncRules: SyncRule[], asyncRules?: AsyncRule[]];
  error?: string;
  type: string;
};

export enum ProfileTypes {
  DIY,
  TITAN,
}

export enum Certification {
  NONE = 0,
  CERTIFIED = 1,
  GOLD_CERTIFIED = 2,
}

export interface FarmingProfileOptions {
  type: ProfileTypes;
  name: string;
  memory: number;
  cpu: number;
  hdd: number;
  ssd: number;
  price: number;
  priceAfter5Years: number;
  maximumTokenPrice: number;
  powerUtilization: number;
  powerCost: number;
  certified: Certification;
  publicIp: boolean;
  investmentCostHW: number;
  nuRequiredPerCu: number;
}
export interface K8SWorker {
  name: string;
  cpu: number;
  memory: number;
  diskSize: number;
  ipv4: boolean;
  ipv6: boolean;
  planetary: boolean;
  rootFsSize: number;
  farm?: FarmInterface;
  selectedNode?: INode;
  rentedBy?: number;
  dedicated: boolean;
  certified: boolean;
}

export interface CaproverWorker {
  selectedNode?: INode;
  name: string;
  farm?: FarmInterface;
  solution?: solutionFlavor;
  dedicated?: boolean;
  certified?: boolean;
}

export interface FarmInterface {
  name: string;
  farmID: number;
  country: string;
  region: string;
}

export interface Flist {
  value: string;
  entryPoint: string;
}

export type VDataTableHeader = VDataTable["headers"];

export enum ProjectName {
  Kubernetes = "Kubernetes",
  Caprover = "CapRover",
  Discourse = "Discourse",
  Funkwhale = "Funkwhale",
  Mastodon = "Mastodon",
  Mattermost = "Mattermost",
  Owncloud = "Owncloud",
  Nextcloud = "Nextcloud",
  Peertube = "Peertube",
  Subsquid = "Subsquid",
  Taiga = "Taiga",
  Wordpress = "Wordpress",
  Gateway = "GatewayName",
  QVM = "Qvm",
  TFhubValidator = "TFhubValidator",
  Casperlabs = "Casperlabs",
  Presearch = "Presearch",
  VM = "VM",
  NodePilot = "NodePilot",
  Fullvm = "Fullvm",
  Algorand = "Algorand",
  Qvm = "Qvm",
  Umbrel = "Umbrel",
  FreeFlow = "Freeflow",
}

export enum SolutionCode {
  peertube = "pt",
  funkwhale = "fw",
  taiga = "tg",
  discourse = "dc",
  owncloud = "oc",
  nextcloud = "nc",
  mattermost = "mm",
  mastodon = "md",
  tfhubvalidator = "tfvalidator",
  casperlabs = "cl",
  presearch = "ps",
  caprover = "cp",
  kubernetes = "k8s",
  machines = "vm",
  vm = "vm",
  nodepilot = "np",
  fullvm = "fvm",
  subsquid = "ss",
  algorand = "al",
  qvm = "qvm",
  umbrel = "um",
  wordpress = "wp",
}

export const solutionType: { [key: string]: string } = {
  algorand: "Algorand",
  caprover: "CapRover",
  casperlabs: "Casperlabs",
  discourse: "Discourse",
  fullvm: "Full Virtual Machine",
  funkwhale: "Funkwhale",
  gatewayname: "Gateway Name",
  kubernetes: "Kubernetes",
  mattermost: "Mattermost",
  nodepilot: "Node Pilot",
  owncloud: "Owncloud",
  nextcloud: "Nextcloud",
  peertube: "Peertube",
  presearch: "Presearch",
  subsquid: "Subsquid",
  taiga: "Taiga",
  umbrel: "Umbrel",
  vm: "Micro Virtual Machine",
  wordpress: "Wordpress",
};

export interface solutionFlavor {
  cpu: number;
  memory: number;
  disk: number;
}

export interface GatewayNode {
  id?: number;
  domain: string;
  useFQDN?: boolean;
  ip?: string;
}

export interface IStatistics {
  data: number | string;
  title: string;
  icon: string;
}

export interface SMTPServer {
  enabled: boolean;
  username: string;
  password: string;
  email: string;
  hostname: string;
  port: number;
  tls: boolean;
  ssl: boolean;
}

export type Validators = typeof validators;

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

export const optionsInitializer: () => FilterOptions = () => ({
  gateway: undefined,
  gpu: undefined,
  page: 1,
  size: 10,
  status: capitalize(NodeStatus.Up) as NodeStatus,
});

import type { FilterFarmInputs } from "@/utils/filter_farms";
import type { FilterNodeInputs } from "@/utils/filter_nodes";

// The input filters<nodeId, farmIds..etc> and the option filters<status, gpu...etc>

// Status, GPU, Gateway, and any other option should be add here.
export type NodeFilterOptions = {
  status: NodeStatus;
  gpu: boolean | undefined;
  gateway: boolean | undefined;
  page: number;
  size: number;
};

export type FarmFilterOptions = {
  page?: number;
  size?: number;
};

export const nodeOptionsInitializer: NodeFilterOptions = {
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

export type NodeTypeColor = {
  color: string;
  type: string;
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
// The input filters<nodeId, farmIds..etc> and the option filters<status, gpu...etc>
export type MixedNodeFilter = {
  inputs: FilterNodeInputs;
  options: NodeFilterOptions;
};

export type MixedFarmFilter = {
  inputs?: FilterFarmInputs;
  options?: FarmFilterOptions;
};
