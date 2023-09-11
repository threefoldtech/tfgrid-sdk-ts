import { KeypairType } from "./sign";

export type PDFPostData = {
  twinid?: string | null;
  pdfUrl: string;
  pubkey: string;
  signature: string;
};

export enum AlertType {
  error = "error",
  warning = "warning",
}

export type PDFSignerProps = {
  pdfurl: string;
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

export interface IThreefoldProvider {
  use(props: PDFSignerProps): Promise<ErrorType>;
  acceptAndSign(pdfData: string, keypairType: KeypairType): Promise<ErrorType>;
  syncErrors(isError: boolean, errorMessage: string): ErrorType;
}
