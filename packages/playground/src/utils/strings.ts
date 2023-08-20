import { randomChoice } from "@threefold/grid_client";

export function generatePassword(length = 12): string {
  return generateString("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 #$%!", length);
}

export interface GenerateNameOptions {
  prefix?: string;
  suffix?: string;
}
export function generateName(length = 12, options?: GenerateNameOptions): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const nums = "0123456789";

  const prefix = options?.prefix ?? "";
  const suffix = options?.suffix ?? "";
  const remainingLength = length - prefix.length - suffix.length;

  return (
    (options?.prefix ?? "") +
    randomChoice(chars) +
    generateString(chars + nums, remainingLength - 1) +
    (options?.suffix ?? "")
  );
}

function generateString(from: string, length: number): string {
  let str = "";
  for (let i = 0; i < length; i++) {
    str += randomChoice(from);
  }
  return str;
}
