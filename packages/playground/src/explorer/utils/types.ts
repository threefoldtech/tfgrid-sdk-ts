import { NodeStatus } from "@threefold/gridproxy_client";

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
