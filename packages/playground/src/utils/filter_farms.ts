import type { InputFilterType } from "../types";
import { isAlphanumeric, isInt, isNumeric } from "./validators";

export type FilterFarmInputs = {
  farmId: InputFilterType;
  farmName: InputFilterType;
};
export const inputsInitializer: FilterFarmInputs = {
  farmId: {
    label: "Farm IDs",
    placeholder: "e.g. 1,2,3.",
    rules: [[isNumeric("Should be a number"), isInt("should be an integer")]],
    type: "text",
  },
  farmName: {
    label: "Farm Name",
    placeholder: "e.g myfarm",
    rules: [[isAlphanumeric("Farm name should be made of either numbers or letters")]],
    type: "text",
  },
};
