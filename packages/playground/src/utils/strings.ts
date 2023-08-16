import { randomChoice } from "@threefold/grid_client";

export function generatePassword(length = 12): string {
  return generateString("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 #$%!", length);
}

export interface GenerateNameOptions {
  prefix?: string;
  suffix?: string;
}
export function generateName(length = 12, options?: GenerateNameOptions): string {
  const vowels = "aeiou";
  const consonants = "bcdfghjklmnpqrstvwxyz";
  const nums = "0123456789";

  return (
    (options?.prefix ?? "") +
    randomChoice(consonants) +
    generateString(vowels + consonants, Math.ceil((length - 2) / 2)) +
    generateString(consonants, Math.floor(length / 3)) +
    generateString(nums, Math.floor(length / 6)) +
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
