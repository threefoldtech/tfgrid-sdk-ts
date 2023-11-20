import type { InputFilterType } from "../types";
import { isAlphanumeric, isInt, isNumeric, isString } from "./validators";

export type FilterFarmInputs = {
  farmId: InputFilterType;
  name: InputFilterType;
  certification: InputFilterType;
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
  certification: {
    label: "Certification Type",
    placeholder: "e.g certified",
    rules: [[isString("Certification type should be written in only letters")]],
    type: "text",
  },
};
