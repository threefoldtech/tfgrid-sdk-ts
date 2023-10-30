import type { Farm, FarmsQuery, Pagination } from "@threefold/gridproxy_client";

import { gridProxyClient } from "@/clients";
import type { FarmFilterInputs } from "@/explorer/utils/types";

import { isAlphanumeric, isNumeric, min, startsWith, validateResourceMaxNumber } from "./validators";

export async function getFilteredFarms(options: FarmsQuery): Promise<Pagination<Farm[]>> {
  const farms = await gridProxyClient.farms.list(options);
  return farms;
}

// Default input Initialization
export const inputsInitializer: FarmFilterInputs = {
  farmId: {
    label: "Farm IDs",
    placeholder: "Filter by farm id.",
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        min("The farm id should be larger then zero.", 1),
        startsWith("The farm id start with zero.", "0"),
        isAlphanumeric("Farm name should be alphanumeric"),
      ],
    ],
    type: "text",
  },
  name: {
    label: "Farm Name",
    placeholder: "Filter by farm name.",
    type: "text",
  },
  twinId: {
    label: "Twin ID",
    placeholder: "Filter by twin id.",
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        min("The twin id should be larger then zero.", 1),
        startsWith("The twin id start with zero.", "0"),
      ],
    ],
    type: "text",
  },
  certificationType: {
    label: "Certification Type",
    placeholder: "Filter by certification type.",
    type: "text",
  },
  pricingPolicyId: {
    label: "Pricing Policy",
    placeholder: "Filter by pricing policy",
    value: undefined,
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        min("The pricing policy should be larger then zero.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    type: "text",
  },
};
