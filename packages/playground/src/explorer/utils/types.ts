import { NodeStatus } from "tf_gridproxy_client";

import type { AsyncRule, SyncRule } from "@/components/input_validator.vue";
import { isInt, isString } from "@/utils/validators";

import { filterInputIntValidationWraper } from "./validation";

export type NodeInputFilterType = {
  label: string;
  placeholder: string;
  value: string | undefined;
  rules: [syncRules: SyncRule[], asyncRules?: AsyncRule[]];
  error?: string;
  type: string;
};

export type NodeInputsFiltersType = {
  nodeId: NodeInputFilterType;
  farmIds: NodeInputFilterType;
  farmName: NodeInputFilterType;
  country: NodeInputFilterType;
  freeSru: NodeInputFilterType;
  freeHru: NodeInputFilterType;
  freeMru: NodeInputFilterType;
};

export const filterInitializer: NodeInputsFiltersType = {
  nodeId: {
    label: "Node ID",
    placeholder: "Filter by node id.",
    value: undefined,
    rules: [[filterInputIntValidationWraper("This field accepts numbers only.")]],
    type: "number",
  },
  farmIds: {
    label: "Farm IDs",
    placeholder: "Find nodes in Farms with ids.",
    value: undefined,
    rules: [[isInt("This field accepts numbers only.")]],
    type: "number",
  },
  farmName: {
    label: "Farm Name",
    placeholder: "Filter by farm name.",
    value: undefined,
    rules: [[]],
    type: "text",
  },
  country: {
    label: "Country Full Name",
    placeholder: "Filter by country.",
    value: undefined,
    rules: [[]],
    type: "text",
  },
  freeSru: {
    label: "Free SRU (GB)",
    placeholder: "Filter by Free SSD greater than or equal to.",
    value: undefined,
    rules: [[isString("This field accepts numbers only.")]],
    type: "number",
  },
  freeHru: {
    label: "Free HRU (GB)",
    placeholder: "Filter by Free HDD greater than or equal to.",
    value: undefined,
    rules: [[isString("This field accepts numbers only.")]],
    type: "number",
  },
  freeMru: {
    label: "Free MRU (GB)",
    placeholder: "Filter by Free Memory greater than or equal to.",
    value: undefined,
    rules: [[isString("This field accepts numbers only.")]],
    type: "number",
  },
};
