import { Keyring } from "@polkadot/keyring";
import { waitReady } from "@polkadot/wasm-crypto";

import profileStore from "@/store";

export async function getKeypair() {
  if (!profileStore.state.profile) {
    throw new Error("Please connect to tfchain wallet before create a signer.");
  }

  await waitReady();
  const keyring = new Keyring({ type: "sr25519" });
  return keyring.addFromUri(profileStore.state.profile!.mnemonic);
}
