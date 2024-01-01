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
  farmName: InputFilterType;
  country: InputFilterType;
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
  nodeId: {
    label: "Node ID",
    placeholder: "Filter by node id.",
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        min("The node id should be larger then zero.", 1),
        startsWith("The node id start with zero.", "0"),
        validateResourceMaxNumber("This is not a valid ID."),
      ],
    ],
    type: "text",
  },
  farmIds: {
    label: "Farm ID",
    placeholder: "Filter by farm id",
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        min("The ID should be larger than zero.", 1),
        isInt("should be an integer"),
        validateResourceMaxNumber("This is not a valid ID."),
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
  totalSru: {
    label: "Total SSD (GB)",
    placeholder: "Filter by total SSD.",
    rules: [
      [
        isNumeric("This field accepts numbers only."),
        min("The total ssd should be larger then zero.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    type: "text",
  },
  totalHru: {
    label: "Total HDD (GB)",
    placeholder: "Filter by total HDD.",
    rules: [
      [
        isNumeric("This field accepts numbers only."),
        min("The total hdd should be larger then zero.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    type: "text",
  },
  totalMru: {
    label: "Total RAM (GB)",
    placeholder: "Filter by total RAM.",
    value: undefined,
    rules: [
      [
        isNumeric("This field accepts numbers only."),
        min("The total ram should be larger then zero.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    type: "text",
  },
  freeSru: {
    label: "Free SSD (GB)",
    placeholder: "Filter by free SSD.",
    rules: [
      [
        isNumeric("This field accepts numbers only."),
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
        isNumeric("This field accepts numbers only."),
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
        isNumeric("This field accepts numbers only."),
        min("The free ram should be larger then zero.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    type: "text",
  },
});

export const DedicatedNodeInitializer: () => DedicatedNodeFilters = () => ({
  total_cru: {
    label: "Total CPU (Cores)",
    placeholder: "Filter by total Cores.",
    type: "text",
    rules: [
      [
        isInt("This Field accepts only a valid number."),
        min("This Field must be a number larger than 0.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
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
});
