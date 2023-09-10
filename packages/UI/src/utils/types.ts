import { KeypairType, type SignReturn } from "./sign";

export type PDFPostData = {
  twinid?: number;
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
};

export type ErrorType = {
  isError: boolean;
  errorMessage: string;
};

export interface IThreefoldProvider {
  use(props: PDFSignerProps): Promise<ErrorType>;
  acceptAndSign(pdfData: string, keypairType: KeypairType): Promise<ErrorType>;
  syncErrors(isError: boolean, errorMessage: string): ErrorType;
  __request(data: SignReturn, account?: any): Promise<ErrorType>;
}
