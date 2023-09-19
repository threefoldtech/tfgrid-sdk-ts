import { Keyring } from "@polkadot/keyring";
import { waitReady } from "@polkadot/wasm-crypto";
import { Buffer } from "buffer";
import MD5 from "crypto-js/md5";

export enum KeypairType {
  sr25519 = "sr25519",
  ed25519 = "ed25519",
}

export interface SignReturn {
  publicKey: string;
  signature: string;
}

export const sign = async (content: string, mnemonic: string, keypairType: KeypairType): Promise<SignReturn> => {
  const hash = MD5(content.toString()).toString();
  const messageBytes = Uint8Array.from(Buffer.from(hash.toString(), "hex"));
  const keyr = new Keyring({ type: keypairType });

  await waitReady();

  const key = keyr.addFromMnemonic(mnemonic);
  const publicKey = key.address;

  const signed = key.sign(messageBytes);
  const signature = Buffer.from(signed).toString("hex");

  return { signature, publicKey };
};
