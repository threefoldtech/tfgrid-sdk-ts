export function hex2a(hex: string) {
  if (!hex) return "";
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    const v = parseInt(hex.substr(i, 2), 16);
    if (v) str += String.fromCharCode(v);
  }
  return str;
}

export enum NetworkEnv {
  dev = "dev",
  test = "test",
  main = "main",
  qa = "qa",
  custom = "custom",
}
