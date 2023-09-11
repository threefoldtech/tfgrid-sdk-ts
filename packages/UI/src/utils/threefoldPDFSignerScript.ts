import axios from "axios";

import { KeypairType, sign, type SignReturn } from "./sign";
import { type ErrorType, type IThreefoldProvider, NetworkEnv, type PDFPostData, type PDFSignerProps } from "./types";

export default class ThreefoldPDFSigner implements IThreefoldProvider {
  private MNEMONIC = import.meta.env.VITE_MNEMONIC;
  private props: PDFSignerProps = { pdfurl: "", dest: "", network: NetworkEnv.dev };

  private selectNetwork(network: string): NetworkEnv {
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
        return NetworkEnv.dev;
    }
  }

  async use(props: PDFSignerProps): Promise<ErrorType> {
    console.warn("Using the normal provider, Please make sure that you provide the mnemonic in the .env file.");

    if (!this.MNEMONIC) {
      return this.syncErrors(true, "Couldn't find a user for the provided mnemonic.");
    }

    this.props = props;
    this.props.network = this.selectNetwork(props.network);

    return this.syncErrors(false, "");
  }

  async acceptAndSign(pdfData: string, keypairType: KeypairType): Promise<ErrorType> {
    console.log("Accepted from ThreefoldPDFSigner");
    if (!pdfData) {
      return this.syncErrors(true, "Cannot read the data from the provided PDF.");
    }
    try {
      const data = await sign(pdfData, this.MNEMONIC, keypairType);
      return await this.__request(data);
    } catch (error: any) {
      return this.syncErrors(true, error.message);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async __request(data: SignReturn, account?: boolean): Promise<ErrorType> {
    const requestBody: PDFPostData = {
      pdfUrl: this.props.pdfurl,
      pubkey: data.publicKey,
      signature: data.signature,
    };

    try {
      const response = await axios.post(this.props.dest, requestBody);
      console.log(response);
      return this.syncErrors(false, "");
    } catch (error: any) {
      console.log(error);
      return this.syncErrors(true, error.message);
    }
  }

  syncErrors(isError: boolean, errorMessage: string): ErrorType {
    const error: ErrorType = { isError: isError, errorMessage: errorMessage };
    return error;
  }
}
