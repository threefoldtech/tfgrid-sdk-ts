import { Keyring } from "@polkadot/keyring";
import { waitReady } from "@polkadot/wasm-crypto";
import { Buffer } from "buffer";
import MD5 from "crypto-js/md5";

export enum KeypairType {
  sr25519 = "sr25519",
  ed25519 = "ed25519",
}

export const sign = async (content: string, mnemonic: string, type: KeypairType): Promise<string> => {
  const hash = MD5(content.toString());
  const message_bytes = Uint8Array.from(Buffer.from(hash.toString(), "hex"));
  const keyr = new Keyring({ type: type });
  const key = keyr.addFromMnemonic(mnemonic);
  await waitReady();
  const signed = key.sign(message_bytes);
  return Buffer.from(signed).toString("hex");
};
