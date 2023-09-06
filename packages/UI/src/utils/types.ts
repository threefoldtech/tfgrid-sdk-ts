import type { SignReturn } from "./sign";

export type PDFPostData = {
  pdfUrl: string;
  pubkey: string;
  signature: SignReturn;
};

export enum AlertType {
  error = "error",
  warning = "warning",
}
