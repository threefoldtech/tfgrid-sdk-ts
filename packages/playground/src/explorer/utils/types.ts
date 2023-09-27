import { CertificationType, type GridNode, type NodeStats, NodeStatus } from "@threefold/gridproxy_client";

import { isNumeric } from "@/utils/validators";

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
  status: NodeStatus.Up,
};

export type ResourceWrapper = {
  name: string;
  value: string;
};

export const inputsInitializer: FilterInputs = {
  nodeId: {
    label: "Node ID",
    placeholder: "Filter by node id.",
    rules: [[isNumeric("This field accepts numbers only.", { no_symbols: true })]],
    type: "text",
  },
  farmIds: {
    label: "Farm IDs",
    placeholder: "e.g. 1, 2, 3",
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        (value: string) => {
          const ids = value.split(",").map((id: string) => {
            if (isNaN(+id)) {
              return isNumeric("This field accepts numbers only.", { no_symbols: true });
            } else {
              return isNumeric("This field accepts numbers only.", { no_symbols: true });
            }
          });
          console.log(ids);
        },
      ],
    ],
    type: "text",
  },
  farmName: {
    label: "Farm Name",
    placeholder: "Filter by farm name.",
    type: "text",
  },
  country: {
    label: "Country Full Name",
    placeholder: "Filter by country.",
    type: "text",
  },
  freeSru: {
    label: "Free SRU (GB)",
    placeholder: "Filter by Free SSD greater than or equal to.",
    rules: [[isNumeric("This field accepts numbers only.", { no_symbols: true })]],
    type: "text",
  },
  freeHru: {
    label: "Free HRU (GB)",
    placeholder: "Filter by Free HDD greater than or equal to.",
    rules: [[isNumeric("This field accepts numbers only.", { no_symbols: true })]],
    type: "text",
  },
  freeMru: {
    label: "Free MRU (GB)",
    placeholder: "Filter by Free Memory greater than or equal to.",
    value: undefined,
    rules: [[isNumeric("This field accepts numbers only.", { no_symbols: true })]],
    type: "text",
  },
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
  location: { city: "", country: "" },
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
};
