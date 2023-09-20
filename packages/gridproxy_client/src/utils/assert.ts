import { isBoolean, isInt, isNumber, isString } from "./guards";
import { capitalize, min } from "./utils";

export function panic(value: any, expect: string): never {
  const found = capitalize(typeof value);
  throw new Error(`Expected argument of type [${expect}] but got [${found}] with value (${value}).`);
}

export function assertNumber(value: number): void | never {
  !isNumber(value) && panic(value, "Number");
}

export function assertInt(value: number): void | never {
  assertNumber(value);
  !isInt(value) && panic(value, "Int");
}

/**
 * @description
 *
 * Natural numbers are positive integers.
 */
export function assertNatural(value: number): void | never {
  assertInt(value);
  !min(value, 0) && panic(value, "Natural");
}

export function assertId(id: number) {
  assertInt(id);
  !min(id, 1) && panic(id, "ID");
}

export function assertString(value: string): void | never {
  !isString(value) && panic(value, "String");
}

export function assertIn<T>(value: T, domain: T[]) {
  !domain.includes(value) && panic(value, `domain(${domain.map(v => '"' + v + '"').join(", ")})`);
}

export function assertBoolean(value: boolean): void | never {
  !isBoolean(value) && panic(value, "Boolean");
}

export function assertPattern(value: string, pattern: RegExp): void | never {
  !pattern.test(value) && panic(value, `${pattern}`);
}
