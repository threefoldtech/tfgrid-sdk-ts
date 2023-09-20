import axios from "axios";

import { sign, type SignReturn } from "./sign";
import { type AcceptConfig, type ErrorType, type RequestData, type SignProps, ThreefoldProvider } from "./types";

export default class ThreefoldSigner extends ThreefoldProvider {
  private MNEMONIC = import.meta.env.VITE_MNEMONIC;

  async use(props: SignProps): Promise<ErrorType> {
    console.warn("Using the normal provider, Please make sure that you provide the mnemonic in the .env file.");

    if (!this.MNEMONIC) {
      return this.syncErrors(true, "Couldn't find a user for the provided mnemonic.");
    }

    this.props = props;
    return this.syncErrors(false, "");
  }

  async acceptAndSign(config: AcceptConfig): Promise<ErrorType> {
    if (!config.pdfData && !config.scriptContent) {
      if (!config.pdfData) {
        return this.syncErrors(true, "Cannot read the data from the provided PDF.");
      } else if (!config.scriptContent) {
        return this.syncErrors(true, "Cannot read the content from the provided script.");
      }
    }

    let data: SignReturn;

    try {
      if (config.pdfData) {
        data = await sign(config.pdfData, this.MNEMONIC, config.keypairType);
        return await this.__request(data);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        data = await sign(config.scriptContent!, this.MNEMONIC, config.keypairType);
        return await this.__request(data);
      }
    } catch (error: any) {
      return this.syncErrors(true, error.message);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async __request(data: SignReturn, account?: boolean): Promise<ErrorType> {
    const requestBody: RequestData = {
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
