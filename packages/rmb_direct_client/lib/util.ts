import * as secp from "@noble/secp256k1";
import { mnemonicToMiniSecret } from "@polkadot/util-crypto";
import type { Client, Twin } from "@threefold/tfchain_client";
import { ValidationError } from "@threefold/types";
import * as bip39 from "bip39";
import { Buffer } from "buffer";
import * as cryptoJs from "crypto-js";
import moment from "moment";

function isValidSeed(seed: string) {
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(seed) ? true : false;
}

function getPublicKey(privateKey: Buffer | string) {
  return "0x" + Buffer.from(secp.getPublicKey(privateKey, true)).toString("hex");
}

export function generatePublicKey(secret: string) {
  let privKey;

  if (bip39.validateMnemonic(secret)) {
    privKey = mnemonicToMiniSecret(secret);
  } else {
    privKey = secret;
    if (secret.startsWith("0x")) {
      privKey = secret.substring(2);
    }

    if (!isValidSeed(privKey) || privKey.length !== 64) {
      throw new ValidationError("Invalid seed. Couldn't get public key from the provided seed.");
    }
  }

  return getPublicKey(privKey);
}

export function hexStringToArrayBuffer(hexString) {
  // remove the leading 0x
  hexString = hexString.replace(/^0x/, "");

  // ensure even number of characters
  if (hexString.length % 2 != 0) {
    console.log("WARNING: expecting an even number of characters in the hexString");
  }

  // check for some non-hex characters
  const bad = hexString.match(/[G-Z\s]/i);
  if (bad) {
    console.log("WARNING: found non-hex characters", bad);
  }

  // split the string into pairs of octets
  const pairs = hexString.match(/[\dA-F]{2}/gi);

  // convert the octets to integers
  const integers = pairs.map(function (s) {
    return parseInt(s, 16);
  });

  const array = new Uint8Array(integers);

  return array.buffer;
}

export function wordArrayToUint8Array(data: cryptoJs.lib.WordArray) {
  const dataArray = new Uint8Array(data.sigBytes);
  for (let i = 0x0; i < data.sigBytes; i++) {
    dataArray[i] = (data.words[i >>> 0x2] >>> (0x18 - (i % 0x4) * 0x8)) & 0xff;
  }
  return new Uint8Array(dataArray);
}

export async function getTwin(id: number, twins: Map<number, { twin: Twin; timestamp: number }>, tfclient: Client) {
  let twin;
  const mappedTwin = twins.get(id);
  const isValid = mappedTwin?.timestamp
    ? moment(mappedTwin?.timestamp).isBefore(moment().subtract(10, "minutes"))
    : false;

  if (mappedTwin && isValid) {
    twin = mappedTwin.twin;
  } else {
    twin = await tfclient.twins.get({ id });
    twins.set(id, { twin: twin, timestamp: Math.round(Date.now() / 1000) });
  }

  return twin;
}
