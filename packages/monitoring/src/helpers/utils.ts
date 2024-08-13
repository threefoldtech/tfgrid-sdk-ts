import { RequestError } from "@threefold/types";

import { ServiceStatus } from "../types";

export async function sendRequest(url: string, options: RequestInit) {
  try {
    const res = await fetch(url, options);
    if (!res?.ok) throw Error(`HTTP Response Code: ${res?.status}`);
  } catch (e) {
    throw new RequestError(`HTTP request failed due to  ${e}.`);
  }
}

export function generateString(length: number): string {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export async function resolveServiceStatus(promise: Promise<any>): Promise<ServiceStatus> {
  try {
    await promise;
    return { alive: true };
  } catch (error) {
    return { alive: false, error };
  }
}
