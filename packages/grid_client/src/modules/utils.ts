import { ValidationError } from "@threefold/types";

// used as decorator
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
