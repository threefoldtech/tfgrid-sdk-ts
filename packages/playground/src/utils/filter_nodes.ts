import type { FilterOptions, GridClient, NodeInfo } from "@threefold/grid_client";

import type { AsyncRule, SyncRule } from "@/components/input_validator.vue";
import type { NodeFilters } from "@/components/select_node.vue";

import { isAlphanumeric, isDecimal, isNumeric, min, startsWith, validateResourceMaxNumber } from "./validators";

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

// Input fields for dedicated nodes
export type DedicatedNodeFilters = {
  total_sru: NodeInputFilterType;
  total_hru: NodeInputFilterType;
  total_mru: NodeInputFilterType;
  total_cru: NodeInputFilterType;
  gpu_vendor_name: NodeInputFilterType;
  gpu_device_name: NodeInputFilterType;
};

// Default input Initialization
export const inputsInitializer: FilterInputs = {
  nodeId: {
    label: "Node ID",
    placeholder: "Filter by node id.",
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        min("The node id should be larger then zero.", 1),
        startsWith("The node id start with zero.", "0"),
      ],
    ],
    type: "text",
  },
  farmIds: {
    label: "Farm IDs",
    placeholder: "e.g. 1,2,3.",
    rules: [
      [
        (value: string) => {
          if (value.endsWith(",") || value.includes(" ")) {
            return { message: "Invalid farm ids format." };
          }

          const ids = value.split(",").map(parseFloat);
          const visNumeric = isNumeric("This field accepts numbers only.", { no_symbols: true });
          const vMin = min("The farm ids should be larger then zero.", 1);

          for (const id of ids) {
            const err1 = visNumeric(String(id));
            const err2 = vMin(String(id));
            if (err1) return err1;
            if (err2) return err2;
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
    placeholder: "Filter by free SSD.",
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        min("The free ssd should be larger then zero.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    type: "text",
  },
  freeHru: {
    label: "Free HDD (GB)",
    placeholder: "Filter by free HDD.",
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        min("The free hdd should be larger then zero.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    type: "text",
  },
  freeMru: {
    label: "Free RAM (GB)",
    placeholder: "Filter by free RAM.",
    value: undefined,
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        min("The free ram should be larger then zero.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    type: "text",
  },
};

export const DedicatedNodeInitializer: DedicatedNodeFilters = {
  total_cru: {
    label: "Total CPU (Cores)",
    placeholder: "Filter by total Cores.",
    type: "text",
    rules: [
      [isNumeric("This Field accepts only a valid number."), min("This Field must be a number larger than 0.", 1)],
    ],
  },
  total_mru: {
    label: "Total RAM (GB)",
    placeholder: "Filter by total Memory.",
    type: "text",
    rules: [
      [
        isNumeric("This Field accepts only a valid number."),
        min("This Field must be a number larger than 0.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
  },
  total_sru: {
    label: "Total SSD (GB)",
    placeholder: "Filter by total SSD.",
    type: "text",
    rules: [
      [
        isNumeric("This Field accepts only a valid number."),
        min("This Field must be a number larger than 0.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
  },
  total_hru: {
    label: "Total HDD (GB)",
    placeholder: "Filter by total HDD.",
    type: "text",
    rules: [
      [
        isNumeric("This Field accepts only a valid number."),
        min("This Field must be a number larger than 0.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
  },

  gpu_device_name: {
    label: "GPU's device name",
    placeholder: "Filter by GPU's device name.",
    rules: [
      [
        (value: string) => {
          const allowedPattern = /^[A-Za-z0-9[\]/,.]+$/;
          if (!allowedPattern.test(value)) {
            isAlphanumeric("This Field accepts only letters and numbers.");
          }
        },
      ],
    ],
    type: "text",
  },
  gpu_vendor_name: {
    label: "GPU's vendor name",
    placeholder: "Filter by GPU's vendor name.",
    type: "text",
    rules: [
      [
        (value: string) => {
          const allowedPattern = /^[A-Za-z0-9[\]/,.]+$/;
          if (!allowedPattern.test(value)) {
            isAlphanumeric("This Field accepts only letters and numbers.");
          }
        },
      ],
    ],
  },
};
