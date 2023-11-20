import { Client } from "@threefold/tfchain_client";
import { ValidationError } from "@threefold/types";

import { KeypairType } from "../../zos/deployment";
import { TFBalances } from "./balances";
import { TFContracts } from "./contracts";
import { TFKVStore } from "./kvstore";
import { TFTermsAndConditions } from "./terms_and_conditions";
import { TFTBridge } from "./tftBridge";
import { TFTPrice } from "./tftPrice";
import { TFTwins } from "./twins";

class TFClient extends Client {
  balances: TFBalances = new TFBalances(this);
  contracts: TFContracts = new TFContracts(this);
  tftPrice: TFTPrice = new TFTPrice(this);
  twins: TFTwins = new TFTwins(this);
  kvStore: TFKVStore = new TFKVStore(this);
  termsAndConditions: TFTermsAndConditions = new TFTermsAndConditions(this);
  tftBridge: TFTBridge = new TFTBridge(this);

  constructor(
    public url: string,
    public mnemonic: string,
    public storeSecret: string | Uint8Array,
    public keypairType: KeypairType = KeypairType.sr25519,
  ) {
    super({ url, mnemonicOrSecret: mnemonic, keypairType });

    if (!storeSecret) {
      throw new ValidationError("Couldn't create TFClient without store secret");
    }
  }
}
export { TFClient };
