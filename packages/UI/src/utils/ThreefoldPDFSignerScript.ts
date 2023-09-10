import axios from "axios";
import { validateMnemonic } from "bip39";

import { KeypairType, sign, type SignReturn } from "./sign";
import type { ErrorType, IThreefoldProvider, PDFPostData, PDFSignerProps } from "./types";

export default class ThreefoldPDFSigner implements IThreefoldProvider {
  private MNEMONIC = import.meta.env.VITE_MNEMONIC;
  private props: PDFSignerProps = { pdfurl: "", dest: "" };

  async use(props: PDFSignerProps): Promise<ErrorType> {
    console.warn("Using the normal provider, Please make sure that you provide the mnemonic in the .env file.");
    this.props = props;

    if (!this.MNEMONIC) {
      return this.syncErrors(true, "Couldn't find a user for the provided mnemonic.");
    }

    const isValidSeeds = validateMnemonic(this.MNEMONIC);
    console.log("isValidSeeds: ", isValidSeeds);
    console.info("Provided mnemonic: ", this.MNEMONIC);
    return this.syncErrors(!isValidSeeds, isValidSeeds ? "" : "Mnemonic doesn't seem to be valid.");
  }

  async acceptAndSign(pdfData: string, keypairType: KeypairType): Promise<ErrorType> {
    console.log("Accepted from ThreefoldPDFSigner");
    if (pdfData) {
      const data = await sign(pdfData, this.MNEMONIC, keypairType);
      if (!data.publicKey || !data.signature) {
        return this.syncErrors(true, "Unexpected signing signature.");
      }
      return await this.__request(data);
    } else {
      return this.syncErrors(true, "Cannot read the data from the provided PDF.");
    }
  }

  async __request(data: SignReturn, account?: boolean): Promise<ErrorType> {
    console.log("Requested form the signer", data, account);
    const requestBody: PDFPostData = {
      pdfUrl: this.props.pdfurl,
      pubkey: data.publicKey,
      signature: data.signature,
    };

    try {
      const response = await axios.post(this.props.dest, requestBody);
      console.log("From try");
      console.log(response);
      return this.syncErrors(false, "");
    } catch (error: any) {
      console.log("From catch");
      console.log(error);
      return this.syncErrors(true, error.message);
    }
  }

  syncErrors(isError: boolean, errorMessage: string): ErrorType {
    const error: ErrorType = { isError: isError, errorMessage: errorMessage };
    return error;
  }
}
