export type Int = number;
export function isInt(value: unknown): value is Int {
  return isNumber(value) && value === parseInt(value.toString(), 10);
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}
