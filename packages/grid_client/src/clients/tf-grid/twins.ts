import { generatePublicKey } from "@threefold/rmb_direct_client";
import { Twins } from "@threefold/tfchain_client";

interface TwinOptions {
  relay: string;
}

class TFTwins extends Twins {
  async create(options: TwinOptions) {
    const pk = generatePublicKey(this.client.mnemonicOrSecret);
    return super.create({ pk, relay: options.relay });
  }

  async update(options: TwinOptions) {
    const pk = generatePublicKey(this.client.mnemonicOrSecret);
    return super.update({ pk, relay: options.relay });
  }
}

export { TFTwins };
