import { ValidationError } from "@threefold/types";

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

export { checkBalance };
