import { KeypairType } from "./sign";

export type RequestData = {
  twinid?: string | null;
  pdfUrl?: string;
  content?: string;
  pubkey: string;
  signature: string;
};

export enum AlertOptions {
  error = "error",
  warning = "warning",
}

export type AcceptConfig = {
  scriptContent?: string;
  pdfData?: string;
  keypairType: KeypairType;
};

export type SignProps = {
  pdfurl?: string;
  dest: string;
  network: NetworkEnv;
};

export enum NetworkEnv {
  main = "main",
  test = "test",
  qa = "qa",
  dev = "dev",
}

export type ErrorType = {
  isError: boolean;
  errorMessage: string;
};

export abstract class ThreefoldProvider {
  protected props: SignProps = { pdfurl: "", dest: "", network: NetworkEnv.dev };
  abstract use(props: SignProps): Promise<ErrorType>;
  abstract acceptAndSign(config: AcceptConfig): Promise<ErrorType>;

  syncErrors(isError: boolean, errorMessage: string): ErrorType {
    const error: ErrorType = { isError: isError, errorMessage: errorMessage };
    return error;
  }

  protected selectNetwork(network: string): NetworkEnv {
    switch (network) {
      case "main":
        return NetworkEnv.main;
      case "test":
        return NetworkEnv.test;
      case "qa":
        return NetworkEnv.qa;
      case "dev":
        return NetworkEnv.dev;
      default:
        return NetworkEnv.main;
    }
  }
}
