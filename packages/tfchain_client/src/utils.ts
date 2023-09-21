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

function isValidSeed(seed: string) {
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(seed) ? true : false;
}

export { isEnvNode, isValidSeed };
