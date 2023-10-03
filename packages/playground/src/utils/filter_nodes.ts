import type { FilterOptions, GridClient, NodeInfo } from "@threefold/grid_client";

import type { AsyncRule, SyncRule } from "@/components/input_validator.vue";
import type { NodeFilters } from "@/components/select_node.vue";

import { isNumeric } from "./validators";

export interface NodeGPUCardType {
  id: string;
  vendor: string;
  device: string;
  contract: number;
}
export interface INode {
  nodeId: number;
  state?: string;
  cards?: NodeGPUCardType[];
}

export async function getNodeCards(grid: GridClient, nodeId: number): Promise<NodeGPUCardType[]> {
  return grid.zos.getNodeGPUInfo({ nodeId });
}

export async function getFilteredNodes(grid: GridClient, options: NodeFilters): Promise<NodeInfo[]> {
  const filters: FilterOptions = {
    farmId: options.farmId ? options.farmId : undefined,
    cru: options.cpu,
    mru: Math.round(options.memory / 1024),
    sru: options.diskSizes.reduce((total, disk) => total + disk),
    publicIPs: options.ipv4,
    hasGPU: options.hasGPU,
    rentedBy: options.rentedBy ? grid.twinId : undefined,
    certified: options.certified,
    availableFor: grid.twinId,
  };
  const nodes = await grid.capacity.filterNodes(filters);
  return nodes;
}

// Node filters used in #Explorer, #Dedicated Nodes...

// Input attrs
export type NodeInputFilterType = {
  label: string;
  placeholder: string;
  value?: string | undefined;
  rules?: [syncRules: SyncRule[], asyncRules?: AsyncRule[]];
  error?: string;
  type: string;
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

// Default input Initialization
export const inputsInitializer: FilterInputs = {
  nodeId: {
    label: "Node ID",
    placeholder: "Filter by node id.",
    rules: [[isNumeric("This field accepts numbers only.", { no_symbols: true })]],
    type: "text",
  },
  farmIds: {
    label: "Farm IDs",
    placeholder: "e.g. 1,2,3",
    rules: [
      [
        (value: string) => {
          if (value.endsWith(",")) {
            return { message: "Invalid farm ids format." };
          }
          const ids = value.split(",").map(parseFloat);
          const validate = isNumeric("This field accepts numbers only.", { no_symbols: true });

          for (const id of ids) {
            const err = validate(String(id));
            if (err) return err;
          }
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
    label: "Free SSD (GB)",
    placeholder: "Filter by Free SSD greater than or equal to.",
    rules: [[isNumeric("This field accepts numbers only.", { no_symbols: true })]],
    type: "text",
  },
  freeHru: {
    label: "Free HDD (GB)",
    placeholder: "Filter by Free HDD greater than or equal to.",
    rules: [[isNumeric("This field accepts numbers only.", { no_symbols: true })]],
    type: "text",
  },
  freeMru: {
    label: "Free RAM (GB)",
    placeholder: "Filter by Free Memory greater than or equal to.",
    value: undefined,
    rules: [[isNumeric("This field accepts numbers only.", { no_symbols: true })]],
    type: "text",
  },
};
