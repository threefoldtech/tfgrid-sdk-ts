import type { InputFilterType } from "../types";
import { isAlphanumeric, isInt, isNumeric, min, validateResourceMaxNumber } from "./validators";

export type FilterFarmInputs = {
  farmId: InputFilterType;
  name: InputFilterType;
  pricingPolicyId: InputFilterType;
};
export const inputsInitializer: FilterFarmInputs = {
  farmId: {
    label: "Farm IDs",
    placeholder: "e.g. 1,2,3.",
    rules: [[isNumeric("Should be a number"), isInt("should be an integer")]],
    type: "text",
  },
  name: {
    label: "Farm Name",
    placeholder: "e.g myfarm",
    rules: [[isAlphanumeric("Farm name should be made of either numbers or letters")]],
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
