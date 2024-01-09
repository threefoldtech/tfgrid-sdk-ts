import type { InputFilterType } from "../types";
import { isInt, isNumeric, isString, min, validateResourceMaxNumber } from "./validators";

export type FilterFarmInputs = {
  farmId: InputFilterType;
  name: InputFilterType;
  freeIps: InputFilterType;
};
export type FilterFarmOptions = {
  page: number;
  size: number;
};
export const optionsInitializer: () => FilterFarmOptions = () => ({
  page: 1,
  size: 10,
});

export const inputsInitializer: () => FilterFarmInputs = () => ({
  farmId: {
    label: "Farm ID",
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        min("The ID should be larger than zero.", 1),
        isInt("should be an integer"),
        validateResourceMaxNumber("This is not a valid ID."),
      ],
    ],
    type: "text",
    tooltip: "Filter by farm id",
  },

  name: {
    label: "Farm Name",
    rules: [[isString("Farm name should be made of either numbers or letters")]],
    type: "text",
    tooltip: "Farm name, e.g myfarm",
  },

  freeIps: {
    label: "Free Public IPs",
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        min("Free Public IP should be larger than zero.", 1),
        isInt("should be an integer"),
        validateResourceMaxNumber("This is not a valid public IP."),
      ],
    ],
    type: "text",
    tooltip: "Filter by free public IPs",
  },
});
