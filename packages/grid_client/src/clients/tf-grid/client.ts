import { Client } from "@threefold/tfchain_client";

import { KeypairType } from "../../zos/deployment";
import { TFBalances } from "./balances";

class TFClient extends Client {
  balances: TFBalances = new TFBalances(this);
  constructor(
    public url: string,
    public mnemonic: string,
    public storeSecret: string | Uint8Array,
    public keypairType: KeypairType = KeypairType.sr25519,
  ) {
    super({ url, mnemonicOrSecret: mnemonic, keypairType });

    if (!storeSecret) {
      throw new Error("Couldn't create TFClient without store secret");
    }
  }
}
export { TFClient };
