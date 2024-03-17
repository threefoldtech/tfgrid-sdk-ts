import { RequestError } from "@threefold/types";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { ServiceStatus } from "src/types";

export async function sendGetRequest(url: string, options: AxiosRequestConfig = {}) {
  try {
    return await axios.get(url, options);
  } catch (e) {
    const { response } = e as AxiosError;
    const errorMessage = (response?.data as { error: string })?.error || (e as Error).message;

    throw new RequestError(`HTTP request failed ${errorMessage ? "due to " + errorMessage : ""}.`);
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
