import { isInt, max, min, required } from "./validators";

function _applyRules(rules: Array<(value: string) => { message: string } | void>): (value: string) => true | string {
  return (value: string) => {
    for (const rule of rules) {
      const res = rule(value);
      if (res && res.message) {
        return res.message;
      }
    }
    return true;
  };
}

export const cruRules = _applyRules([
  required("CPU is required."),
  isInt("CPU must be a valid integer."),
  min("CPU min is 1 cores.", 1),
  max("CPU max is 256 cores.", 256),
]);

export const mruRules = _applyRules([
  required("Memory is required."),
  isInt("Memory must be a valid integer."),
  max("Maximum allowed memory is 1024 GB.", 1024),
]);

export const sruRules = _applyRules([
  required("SSD Storage size is required."),
  isInt("SSD Storage size must be a valid integer."),
  max("Maximum allowed ssd storage size is 1000000 GB.", 1000000),
]);

export const hruRules = _applyRules([
  isInt("HDD Storage size must be a valid integer."),
  max("Maximum allowed hdd storage size is 1000000 GB.", 1000000),
  min("Minimum allowed hdd storage size is 0 GB.", 0),
]);

export const balanceRules = _applyRules([min("Balance should be a positive integer.", 1)]);
