import { KeypairType } from "@polkadot/util-crypto/types";
import { Client as RMBClient } from "@threefold/rmb_direct_client";
import { generateString } from "src/helpers/utils";
import { IServiceAliveness } from "src/types";

export class RMBMonitor implements IServiceAliveness {
  public readonly ServiceName = "RMB";
  public ServiceURL: string;
  private rmbClient: RMBClient;
  constructor(public relayUrl: string, chainUrl: string, keypairType: KeypairType) {
    this.ServiceURL = relayUrl;
    this.rmbClient = new RMBClient(
      chainUrl,
      relayUrl,
      "energy garage female trend guard pipe skill dumb drill defy crush genuine",
      generateString(10),
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
  public async isAlive(): Promise<boolean> {
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
}
