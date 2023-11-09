import { getSharedSecret, utils } from "@noble/secp256k1";
import { KeyringPair } from "@polkadot/keyring/types";
import { mnemonicToSeedSync, validateMnemonic } from "bip39";
import { Buffer } from "buffer";

export enum KPType {
  sr25519 = "sr25519",
  ed25519 = "ed25519",
}
export function sign(payload: string | Uint8Array, signer: KeyringPair) {
  const typePrefix = signer.type === KPType.sr25519 ? "s" : "e";
  const sig = signer.sign(payload);
  const prefix = Buffer.from(typePrefix).readUInt8(0);
  const sigPrefixed = new Uint8Array([prefix, ...sig]);

  return sigPrefixed;
}

export function createShared(pubKey: Uint8Array, hexSeedOrMnemonic: string) {
  let privateKey: Uint8Array | string = hexSeedOrMnemonic.slice(2);

  if (validateMnemonic(hexSeedOrMnemonic)) {
    const seed = mnemonicToSeedSync(hexSeedOrMnemonic);
    privateKey = new Uint8Array(seed).slice(0, 32);
  }

  const pointX = getSharedSecret(privateKey, pubKey);
  return utils.sha256(pointX.slice(1, 33));
}
