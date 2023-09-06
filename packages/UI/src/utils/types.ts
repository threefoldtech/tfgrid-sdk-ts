import type { SignReturn } from "./sign";

export type PDFPostData = {
  pdfUrl: string;
  pubkey: string;
  signature: SignReturn;
};
