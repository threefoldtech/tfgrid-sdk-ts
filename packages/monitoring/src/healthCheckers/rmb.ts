import { KeypairType } from "@polkadot/util-crypto/types";
import { Client as RMBClient } from "@threefold/rmb_direct_client";
import { ILivenessChecker } from "src/types";

export class RMBHealthCheck implements ILivenessChecker {
  public readonly ServiceName: "RMB";
  public ServiceURL: string;
  private rmbClient: RMBClient;
  constructor(public relayUrl, chainUrl: string, keypairType: KeypairType) {
    this.ServiceURL = relayUrl;
    this.rmbClient = new RMBClient(
      chainUrl,
      relayUrl,
      "energy garage female trend guard pipe skill dumb drill defy crush genuine",
      this.generateString(10),
      keypairType,
      0,
    );
  }
  private async setUp() {
    try {
      await this.rmbClient.connect();
    } catch (e) {
      console.log(e);
    }
  }
  public disconnectHandler() {
    this.rmbClient.disconnect();
  }
  public async LiveChecker(): Promise<boolean> {
    try {
      if (!this.rmbClient?.con?.OPEN) await this.setUp();
      await this.rmbClient.ping(2);
      return true;
    } catch (e) {
      //stream error
      console.log(e);
      return false;
    }
  }
  generateString(length: number): string {
    let result = "";
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
