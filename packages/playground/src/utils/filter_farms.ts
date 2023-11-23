import type { InputFilterType } from "../types";
import { isInt, isNumeric, isString, min } from "./validators";

export type FilterFarmInputs = {
  farmId: InputFilterType;
  name: InputFilterType;

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
