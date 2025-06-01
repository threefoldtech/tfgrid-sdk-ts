import { isInt, isNumeric, max, min, required } from "./validators";

function _applyRules(rules: Array<(value: string) => { message: string } | void>): (value: string) => true | string {
  return (value: string) => {
    value = value?.toString();
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
  min("Minimum allowed cpu cores is 1", 1),
  max("Maximum allowed cpu cores is 256.", 256),
]);

export const nuRules = _applyRules([
  required("Bandwidth is required."),
  isInt("Bandwidth must be a valid integer."),
  min("Minimum allowed bandwidth is 0.", 0),
  max("Maximum allowed bandwidth is 1000000.", 1000000),
]);

export const mruRules = _applyRules([
  required("Memory is required."),
  min("Minimum allowed Memory size is .5 GB.", 0.5),
  isNumeric("Memory must be a valid number."),
  max("Maximum allowed memory is 1024 GB.", 1024),
]);

export const sruRules = _applyRules([
  required("SSD Storage size is required."),
  isInt("SSD Storage size must be a valid integer."),
  max("Maximum allowed ssd storage size is 1000000 GB.", 1000000),
  min("Minimum allowed ssd storage size is 0 GB.", 0),
]);

export const hruRules = _applyRules([
  isInt("HDD Storage size must be a valid integer."),
  max("Maximum allowed hdd storage size is 1000000 GB.", 1000000),
  min("Minimum allowed hdd storage size is 0 GB.", 0),
]);

export const balanceRules = _applyRules([
  isNumeric("Balance must be a valid number."),
  min("Minimum allowed balance is 0.", 0),
  max("Maximum allowed balance is 1e15 TFT.", 10 ** 15),
]);

export function normalizePrice(price: number) {
  return parseInt(String(price * 1000)) / 1000;
}

export function computePackageColor(packageName?: string): string {
  switch (packageName) {
    case "default":
      return "#74DDC3";
    case "bronze":
      return "linear-gradient(270deg, #AF6114 0%, #ffc58b 25%, #DC8E41 49.83%, #f9d1a9 77.32%, #AF6114 100%)";
    case "silver":
      return "linear-gradient(270deg, #7d7d7d 0%, #ffffff 15%, #adadad 24.83%, #ffffff 50.32%, #adadad 71.83%, #ffffff 87.32%, #a0a0a0 100%)";
    case "gold":
      return "linear-gradient(270deg, #bf953f 0%, #fffce0 25%, #d7ae56 49.83%, #fffce0 77.32%, #aa771c 100%)";
    default:
      return "#f3f3f3";
  }
}

/**
 * Calculates the additional TFT balance needed for a package upgrade
 *
 * This function determines how many additional TFT tokens are needed for a
 * package upgrade, considering the current price, any applied discount,
 * and the user's existing balance.
 *
 * @param priceTFT - The current price in TFT tokens
 * @param appliedDiscount - The discount percentage (0-100) applied to the package
 * @param needUpgrade - Flag indicating if an upgrade is required
 * @param currentBalance - The user's current TFT balance
 * @returns The additional TFT balance needed to perform the upgrade, or 0 if no upgrade is needed or balance is sufficient
 * @throws Error if input parameters are invalid
 */
export function calculateUpgradeBalanceNeeded(
  priceTFT: number,
  appliedDiscount: number,
  needUpgrade = false,
  currentBalance = 0,
): number {
  if (!needUpgrade) return 0;

  if (priceTFT < 0) {
    throw new Error("Price cannot be negative");
  }

  if (appliedDiscount < 0 || appliedDiscount > 100) {
    throw new Error("Discount must be between 0 and 100");
  }

  if (appliedDiscount === 100) {
    throw new Error("Discount cannot be 100% (would result in division by zero)");
  }

  const originalPrice = (priceTFT * 100) / (100 - appliedDiscount);

  // Calculate balance needed; +1 to pass upgrade threshold
  const balanceNeeded = Math.ceil(originalPrice * 18 - currentBalance) + 1;
  return balanceNeeded > 0 ? balanceNeeded : 0;
}
