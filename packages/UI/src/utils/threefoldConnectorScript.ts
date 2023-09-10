import { type Account, ThreefoldWalletConnectorApi } from "tf-wallet-connector-api";

import { KeypairType, sign, type SignReturn } from "./sign";
import type { ErrorType, IThreefoldProvider, PDFSignerProps } from "./types";

export default class ThreefoldConnector implements IThreefoldProvider {
  private props: PDFSignerProps = { pdfurl: "", dest: "" };

  async use(props: PDFSignerProps): Promise<ErrorType> {
    this.props = props;
    console.log("Used from Connector");
    const isInstalled = async () => {
      return await ThreefoldWalletConnectorApi.isInstalled();
    };

    if (!isInstalled()) {
      return this.syncErrors(true, "Please make sure you have installed/linked the Threefold Connector extension.");
    }

    return this.syncErrors(false, "");
  }

  async acceptAndSign(pdfData: string, keypairType: KeypairType): Promise<ErrorType> {
    console.log("Accepted from ThreefoldPDFSigner");

    const hasAccess = async () => {
      return await ThreefoldWalletConnectorApi.hasAccess();
    };

    const requestAccess = async () => {
      return await ThreefoldWalletConnectorApi.requestAccess();
    };

    if (pdfData) {
      if (!hasAccess()) {
        requestAccess();
      }

      const account: Account | null = await ThreefoldWalletConnectorApi.selectDecryptedAccount();
      const data = await sign(pdfData, account?.mnemonic ?? "", keypairType);

      if (!data.publicKey || !data.signature) {
        return this.syncErrors(true, "Unexpected signing signature.");
      }

      await this.__request(data);
      return this.syncErrors(false, "");
    } else {
      return this.syncErrors(true, "Cannot read the data from the provided PDF.");
    }
  }

  syncErrors(isError: boolean, errorMessage: string): ErrorType {
    const error: ErrorType = { isError: isError, errorMessage: errorMessage };
    return error;
  }

  async __request(data: SignReturn, account?: Account): Promise<ErrorType> {
    console.log("Requested form the connector", data, account);
    return this.syncErrors(false, "");
  }
}
