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
