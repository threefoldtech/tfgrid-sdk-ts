import type { InputFilterType } from "../types";
import { isInt, isNumeric, isString, min, validateResourceMaxNumber } from "./validators";

export type FilterFarmInputs = {
  farmId: InputFilterType;
  name: InputFilterType;
  freeIps: InputFilterType;
};

export const inputsInitializer: () => FilterFarmInputs = () => ({
  farmId: {
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

  name: {
    label: "Farm Name",
    placeholder: "Farm name, e.g myfarm",
    rules: [[isString("Farm name should be made of either numbers or letters")]],
    type: "text",
  },

  freeIps: {
    label: "Free PubIPs",
    placeholder: "Filter by free public IPs",
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        min("Free Public IP should be larger than zero.", 1),
        isInt("should be an integer"),
        validateResourceMaxNumber("This is not a valid public IP."),
      ],
    ],
    type: "text",
  },
});
