import { RequestError } from "@threefold/types";
import { AxiosError, default as axios, Method } from "axios";

async function sendWithFullResponse(method: Method, url: string, body: string, headers: Record<string, string>) {
  const options = {
    method: method,
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
    throw new RequestError(`HTTP request failed ${errorMessage ? "due to " + errorMessage : ""}.`, response?.status);
  }
}

async function send(method: Method, url: string, body: string, headers: Record<string, string>) {
  const response = await sendWithFullResponse(method, url, body, headers);
  return response.data;
}

export { send, sendWithFullResponse };
