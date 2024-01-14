import type { GridClient } from "@threefold/grid_client";

import type { InputFilterType } from "../types";
import { isAlphanumeric, isInt, isNumeric, min, startsWith, validateResourceMaxNumber } from "./validators";
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
  certified?: string;
}

export async function getNodeCards(grid: GridClient, nodeId: number): Promise<NodeGPUCardType[]> {
  return grid.zos.getNodeGPUInfo({ nodeId });
}

// Node filters used in #Explorer, #Dedicated Nodes...

// Input fields
export type FilterNodeInputs = {
  nodeId: InputFilterType;
  farmIds: InputFilterType;
  freeSru: InputFilterType;
  freeHru: InputFilterType;
  freeMru: InputFilterType;
  totalSru: InputFilterType;
  totalHru: InputFilterType;
  totalMru: InputFilterType;
};

// Input fields for dedicated nodes
export type DedicatedNodeFilters = {
  total_sru: InputFilterType;
  total_hru: InputFilterType;
  total_mru: InputFilterType;
  total_cru: InputFilterType;
  gpu_vendor_name: InputFilterType;
  gpu_device_name: InputFilterType;
};

// Default input Initialization
export const inputsInitializer: () => FilterNodeInputs = () => ({
  farmIds: {
    label: "Farm ID",
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        min("The ID should be larger than zero.", 1),
        isInt("should be an integer"),
        validateResourceMaxNumber("This is not a valid ID."),
      ],
    ],
    tooltip: "Filter by farm id",
    type: "text",
  },
  nodeId: {
    label: "Node ID",
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        min("The node id should be larger then zero.", 1),
        startsWith("The node id start with zero.", "0"),
        validateResourceMaxNumber("This is not a valid ID."),
      ],
    ],
    tooltip: "Filter by node id.",
    type: "text",
  },
  totalSru: {
    label: "Min SSD (GB)",
    rules: [
      [
        isNumeric("This field accepts numbers only."),
        min("The total ssd should be larger then zero.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    tooltip: "Filter by the minimum total amount of SSD in the node.",
    type: "text",
  },
  totalHru: {
    label: "Min HDD (GB)",
    rules: [
      [
        isNumeric("This field accepts numbers only."),
        min("The total hdd should be larger then zero.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    tooltip: "Filter by the minimum total amount of HDD in the node.",
    type: "text",
  },
  totalMru: {
    label: "Min RAM (GB)",
    value: undefined,
    rules: [
      [
        isNumeric("This field accepts numbers only."),
        min("The total ram should be larger then zero.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    tooltip: "Filter by the minimum total amount of RAM in the node.",
    type: "text",
  },
  freeSru: {
    label: "Free SSD (GB)",
    rules: [
      [
        isNumeric("This field accepts numbers only."),
        min("The free ssd should be larger then zero.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    tooltip: "Filter by the minimum available amount of SSD in the node.",
    type: "text",
  },
  freeHru: {
    label: "Free HDD (GB)",
    rules: [
      [
        isNumeric("This field accepts numbers only."),
        min("The free hdd should be larger then zero.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    tooltip: "Filter by the minimum available amount of HDD in the node.",
    type: "text",
  },
  freeMru: {
    label: "Free RAM (GB)",
    value: undefined,
    rules: [
      [
        isNumeric("This field accepts numbers only."),
        min("The free ram should be larger then zero.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    tooltip: "Filter by the minimum available amount of RAM in the node.",
    type: "text",
  },
});

export const DedicatedNodeInitializer: () => DedicatedNodeFilters = () => ({
  total_cru: {
    label: "Min CPU (Cores)",
    type: "text",
    rules: [
      [
        isInt("This Field accepts only a valid number."),
        min("This Field must be a number larger than 0.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    tooltip: "Filter by the minimum total amount of CPU Cores in the node.",
  },
  total_mru: {
    label: "Min RAM (GB)",
    type: "text",
    rules: [
      [
        isNumeric("This Field accepts only a valid number."),
        min("This Field must be a number larger than 0.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    tooltip: "Filter by the minimum total amount of RAM in the node.",
  },
  total_sru: {
    label: "Min SSD (GB)",
    type: "text",
    rules: [
      [
        isNumeric("This Field accepts only a valid number."),
        min("This Field must be a number larger than 0.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    tooltip: "Filter by the minimum total amount of SSD in the node.",
  },
  total_hru: {
    label: "Min HDD (GB)",
    type: "text",
    rules: [
      [
        isNumeric("This Field accepts only a valid number."),
        min("This Field must be a number larger than 0.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    tooltip: "Filter by the minimum total amount of HDD in the node.",
  },

  gpu_device_name: {
    label: "GPU's device name",
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
    tooltip: "Filter by GPU's device name.",
    type: "text",
  },
  gpu_vendor_name: {
    label: "GPU's vendor name",
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
    tooltip: "Filter by GPU's vendor name.",
  },
});
