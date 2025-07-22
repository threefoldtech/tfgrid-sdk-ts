import { ValidationError } from "@threefold/types";

import { discountPackages } from "./calculator";

/**
 * Decorator function to check if the balance is enough to apply an extrinsic.
 *
 * @throws {`ValidationError`} if the balance is less than `0.001`.
 * @param target The target object
 * @param propertyKey The property key
 * @param descriptor The property descriptor
 * @returns The modified property descriptor with balance check logic
 */
function checkBalance(target, propertyKey: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  descriptor.value = async function (...args) {
    const balances = await this.config.tfclient.balances.getMyBalance();
    if (balances["free"] < 0.001) {
      throw new ValidationError("Balance is not enough to apply an extrinsic.");
    }
    return await method.apply(this, args);
  };
}

/**
 * Calculates discount packages based on balance and prices.
 * 
 * @param balance - The user's balance amount
 * @param dedicatedPrice - The price for dedicated resources
 * @param sharedPrice - The price for shared resources
 * @returns An object containing the determined discount package levels for dedicated and shared resources
 */
function calculateDiscountPackage(
  balance: number,
  dedicatedPrice: number,
  sharedPrice: number,
): { dedicatedPackage: string; sharedPackage: string } {
  let dedicatedPackage = "none";
  let sharedPackage = "none";
  for (const pkg in discountPackages) {
    if (balance > dedicatedPrice * discountPackages[pkg].duration) {
      dedicatedPackage = pkg;
    }
    if (balance > sharedPrice * discountPackages[pkg].duration) {
      sharedPackage = pkg;
    }
  }
  return { dedicatedPackage, sharedPackage };
}
export { checkBalance, calculateDiscountPackage };
