import type { InputFilterType } from "../types";
import { isAlphanumeric, isInt, isNumeric, isString, min, validateResourceMaxNumber } from "./validators";

export type FilterFarmInputs = {
  farmId: InputFilterType;
  name: InputFilterType;
  pricingPolicyId: InputFilterType;
  totalIps: InputFilterType;
};
export const inputsInitializer: FilterFarmInputs = {
  farmId: {
    label: "Farm IDs",
    placeholder: "e.g. 1,2,3.",
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        min("The ID should be larger than zero.", 1),
        isInt("should be an integer"),
      ],
    ],
    type: "text",
  },
  name: {
    label: "Farm Name",
    placeholder: "e.g myfarm",
    rules: [[isString("Farm name should be made of either numbers or letters")]],
    type: "text",
  },
  pricingPolicyId: {
    label: "Pricing Policy",
    placeholder: "e.g 1",
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        min("The pricing policy should be larger than zero.", 1),
        validateResourceMaxNumber("This value is out of range."),
      ],
    ],
    type: "text",
  },
  totalIps: {
    label: "Total  PubIPs",
    placeholder: "e.g. 1,2,3.",
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        min("Total Public IP should be larger than zero.", 1),
        isInt("should be an integer"),
      ],
    ],
    type: "text",
  },
};
