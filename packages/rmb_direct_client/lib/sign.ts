import { getSharedSecret, utils } from "@noble/secp256k1";
import { KeyringPair } from "@polkadot/keyring/types";
import { mnemonicToMiniSecret } from "@polkadot/util-crypto";
import { isAddress } from "@polkadot/util-crypto";
import { ValidationError } from "@threefold/types";
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
  let privateKey: Uint8Array | string;

  if (hexSeedOrMnemonic.length === 66 && isAddress(hexSeedOrMnemonic)) {
    privateKey = hexSeedOrMnemonic.slice(2);
  } else if (hexSeedOrMnemonic.length === 64 && isAddress(`0x${hexSeedOrMnemonic}`)) {
    privateKey = hexSeedOrMnemonic;
  } else if (validateMnemonic(hexSeedOrMnemonic)) {
    const seed = mnemonicToMiniSecret(hexSeedOrMnemonic);
    privateKey = new Uint8Array(seed).slice(0, 32);
  } else {
    throw new ValidationError(`Expected a valid mnemonic or hexSeed in "createShared" but got "${hexSeedOrMnemonic}".`);
  }

  const pointX = getSharedSecret(privateKey, pubKey);
  return utils.sha256(pointX.slice(1, 33));
}
