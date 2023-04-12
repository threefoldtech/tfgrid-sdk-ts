import * as secp from "@noble/secp256k1";
import { KeyringPair } from "@polkadot/keyring/types";
import * as bip39 from "bip39";
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

export async function createShared(pubKey: Uint8Array, mnemonic: string) {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const privateKey = new Uint8Array(seed).slice(0, 32);
    const pointX = secp.getSharedSecret(privateKey, pubKey);
    const key = await secp.utils.sha256(pointX.slice(1, 33));
    return key;
}
