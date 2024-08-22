import { ValidationError } from "@threefold/types";

function isEnvNode(): boolean {
  return (
    typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node !== "undefined"
  );
}

export function checkConnection(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = async function (...args) {
    await this.client.connect();
    return originalMethod.apply(this, args);
  };
}
/**
 * A decorate that should be added to a method that requires a council member to call it.
 *
 * @returns The original method call.
 * @throws {ValidationError} - If the caller is not a council member.
 */
export function requireCouncil(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = async function (...args) {
    const members = await this.client.council.members();
    if (!members.includes(this.client.address)) {
      throw new ValidationError("You have to be a council member to create this extrinsic");
    }
    return originalMethod.apply(this, args);
  };
}

function isValidSeed(seed: string) {
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(seed) ? true : false;
}

export { isEnvNode, isValidSeed };
