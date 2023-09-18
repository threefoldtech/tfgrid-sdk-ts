import { isInt, required } from "@/utils/validators";

export type NodeInputFilterType = {
  label: string;
  placeholder: string;
  value: string | undefined;
  rules?: any;
};

export type NodeFiltersType = {
  nodeId: NodeInputFilterType;
  twinId: NodeInputFilterType;
  farmIds: NodeInputFilterType;
  farmName: NodeInputFilterType;
  country: NodeInputFilterType;
  freeSru: NodeInputFilterType;
  freeHru: NodeInputFilterType;
  freeMru: NodeInputFilterType;
};

export const filterInitializer: NodeFiltersType = {
  nodeId: {
    label: "Node ID",
    placeholder: "Filter by node id.",
    value: undefined,
    rules: [isInt("This field accepts numbers only."), required("This field is required.")],
  },
  twinId: {
    label: "Twin ID",
    placeholder: "Filter by twin id.",
    value: undefined,
  },
  farmIds: {
    label: "Farm IDs",
    placeholder: "Find nodes in Farms with ids.",
    value: undefined,
  },
  farmName: {
    label: "Farm Name",
    placeholder: "Filter by farm name.",
    value: undefined,
  },
  country: {
    label: "Country Full Name",
    placeholder: "Filter by country.",
    value: undefined,
  },
  freeSru: {
    label: "Free SRU (GB)",
    placeholder: "Filter by Free SSD greater than or equal to.",
    value: undefined,
  },
  freeHru: {
    label: "Free HRU (GB)",
    placeholder: "Filter by Free HDD greater than or equal to.",
    value: undefined,
  },
  freeMru: {
    label: "Free MRU (GB)",
    placeholder: "Filter by Free Memory greater than or equal to.",
    value: undefined,
  },
};
