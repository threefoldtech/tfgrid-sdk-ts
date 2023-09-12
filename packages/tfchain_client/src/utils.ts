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
export function hex2a(hex: string) {
  if (!hex) return "";
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    const v = parseInt(hex.substr(i, 2), 16);
    if (v) str += String.fromCharCode(v);
  }
  return str;
}
function isValidSeed(seed: string) {
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(seed) ? true : false;
}

export { isEnvNode, isValidSeed };
