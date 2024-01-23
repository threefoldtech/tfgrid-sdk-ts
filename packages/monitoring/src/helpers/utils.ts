import { RequestError } from "@threefold/types";
import axios, { AxiosError } from "axios";

export async function sendGetRequest(url: string, body: string, headers: Record<string, string>) {
  const options = {
    method: "get",
    url: url,
    data: body,
    headers: headers,
  };
  try {
    return await axios(options);
  } catch (e) {
    const { response } = e as AxiosError;
    let errorMessage = (response?.data as { error: string })?.error;
    if (!errorMessage) {
      errorMessage = (e as AxiosError).message;
    }
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
