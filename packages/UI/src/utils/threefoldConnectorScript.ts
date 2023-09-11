import axios from "axios";
import { type PublicAccount, ThreefoldWalletConnectorApi } from "tf-wallet-connector-api";

import { KeypairType, sign, type SignReturn } from "./sign";
import { type ErrorType, type IThreefoldProvider, NetworkEnv, type PDFPostData, type PDFSignerProps } from "./types";

export default class ThreefoldConnector implements IThreefoldProvider {
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
    console.warn(
      "Using the connector provider, Please make sure that you installed the Threefold Connector extension.",
    );

    const isInstalled = await ThreefoldWalletConnectorApi.isInstalled();

    if (!isInstalled) {
      return this.syncErrors(true, "Please make sure you have installed/linked the Threefold Connector extension.");
    }

    this.props = props;
    this.props.network = this.selectNetwork(props.network);

    return this.syncErrors(false, "");
  }

  async acceptAndSign(pdfData: string, keypairType: KeypairType): Promise<ErrorType> {
    if (!pdfData) {
      return this.syncErrors(true, "Cannot read the data from the provided PDF.");
    }

    const requestAccess = await ThreefoldWalletConnectorApi.requestAccess();
    if (!requestAccess) {
      return this.syncErrors(true, "Please make sure that you accepted the access request.");
    }

    const account: PublicAccount | null = await ThreefoldWalletConnectorApi.selectDecryptedAccount(
      this.props.network || NetworkEnv.main,
    );

    const data = await sign(pdfData, account?.mnemonic ?? "", keypairType);

    if (!data.publicKey || !data.signature) {
      return this.syncErrors(true, "Unexpected signing signature.");
    }

    return await this.__request(data, account);
  }

  syncErrors(isError: boolean, errorMessage: string): ErrorType {
    const error: ErrorType = { isError: isError, errorMessage: errorMessage };
    return error;
  }

  private async __request(data: SignReturn, account?: PublicAccount | null): Promise<ErrorType> {
    if (!account) {
      return this.syncErrors(
        true,
        "Failed to load account. Make sure you have installed the ThreeFold Connector extension and activated an account.",
      );
    }

    const requestBody: PDFPostData = {
      pdfUrl: this.props.pdfurl,
      pubkey: data.publicKey,
      signature: data.signature,
      twinid: account?.metadata[this.props.network].twinId,
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
}
