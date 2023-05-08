import * as secp from "@noble/secp256k1";
import { Twins } from "@threefold/tfchain_client";
import * as bip39 from "bip39";

interface TwinOptions {
  relay: string;
}

class TFTwins extends Twins {
  getPublicKey(mnemonic: string) {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const privKey = new Uint8Array(seed).slice(0, 32);
    const pk = "0x" + Buffer.from(secp.getPublicKey(privKey, true)).toString("hex");
    return pk;
  }

  async create(options: TwinOptions) {
    const pk = this.getPublicKey(this.client.mnemonicOrSecret);

    return this.client.twins.create({ pk, relay: options.relay });
  }

  async update(options: TwinOptions) {
    const pk = this.getPublicKey(this.client.mnemonicOrSecret);

    return this.client.twins.update({ pk, relay: options.relay });
  }
}

export { TFTwins };
