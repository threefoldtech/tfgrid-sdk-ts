import { type PublicAccount, ThreefoldWalletConnectorApi } from "@threefold/extension_api";
import axios from "axios";

import { KeypairType, sign, type SignReturn } from "./sign";
import {
  type AcceptConfig,
  type ErrorType,
  NetworkEnv,
  type RequestData,
  type SignProps,
  ThreefoldProvider,
} from "./types";

export default class ThreefoldConnector extends ThreefoldProvider {
  private config: AcceptConfig = { keypairType: KeypairType.ed25519 };
  private network: NetworkEnv = NetworkEnv.main;

  async use(props: SignProps): Promise<ErrorType> {
    console.warn(
      "Using the connector provider, Please make sure that you installed the Threefold Connector extension.",
    );

    const isInstalled = await ThreefoldWalletConnectorApi.isInstalled();

    if (!isInstalled) {
      return this.syncErrors(true, "Please make sure you have installed/linked the Threefold Connector extension.");
    }

    this.props = props;
    this.network = this.selectNetwork(props.network);

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

    this.config = config;

    const requestAccess = await ThreefoldWalletConnectorApi.requestAccess();
    if (!requestAccess) {
      return this.syncErrors(true, "Please make sure that you accepted the access request.");
    }

    const account: PublicAccount | null = await ThreefoldWalletConnectorApi.selectDecryptedAccount(
      this.network || NetworkEnv.main,
    );

    let data: SignReturn;

    if (config.pdfData) {
      data = await sign(config.pdfData, account?.mnemonic ?? "", config.keypairType);
    } else {
      data = await sign(config.scriptContent!, account?.mnemonic ?? "", config.keypairType);
    }

    if (!data.publicKey || !data.signature) {
      return this.syncErrors(true, "Unexpected signing signature.");
    }

    return await this.__request(data, account);
  }

  private async __request(data: SignReturn, account?: PublicAccount | null): Promise<ErrorType> {
    if (!account) {
      return this.syncErrors(
        true,
        "Failed to load account. Make sure you have installed the ThreeFold Connector extension and activated an account.",
      );
    }

    const requestBody: RequestData = {
      pdfUrl: this.props.pdfurl,
      pubkey: data.publicKey,
      content: this.config.scriptContent,
      signature: data.signature,
      twinid: account?.metadata[this.network].twinId,
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
