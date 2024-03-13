import { mnemonicToMiniSecret } from "@polkadot/util-crypto";
import { validateMnemonic } from "bip39";
import { Buffer } from "buffer";
import * as crypto from "crypto";
import nacl, { randomBytes } from "tweetnacl";
import utils from "tweetnacl-util";

function generateString(length: number): string {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(choices) {
  const random = Math.floor(Math.random() * choices.length);
  return choices[random];
}

function randomSecret() {
  return randomBytes(nacl.box.secretKeyLength);
}

function randomSecretAsHex() {
  return utils.encodeBase64(randomSecret());
}

function randomNonce() {
  return randomBytes(nacl.box.nonceLength);
}

function log(message) {
  console.log(JSON.stringify(message, null, 2));
}

function toHexSeed(mnemonicOrHexSeed: string): string {
  if (validateMnemonic(mnemonicOrHexSeed)) {
    const seed = mnemonicToMiniSecret(mnemonicOrHexSeed);
    return "0x" + Buffer.from(seed).toString("hex");
  }

  const seed = mnemonicOrHexSeed.length === 64 ? mnemonicOrHexSeed : mnemonicOrHexSeed.slice(2);
  return "0x" + seed;
}

function formatErrorMessage(prefix: string, error: Error) {
  return `${prefix}\n\t ${error.message}`;
}

function generateRandomHexSeed(length: number) {
  const bytes = crypto.randomBytes(length);
  return bytes.toString("hex");
}

function zeroPadding(length: number, num: number) {
  return num.toString(16).padStart(length, "0");
}

/**
 * Removes any key-value pairs from an object where the value is either undefined or an empty string.
 * @param obj - The input object from which to remove undefined and empty string values.
 * @returns A new object with the same keys as the input object, but without any key-value pairs where the value is either undefined or an empty string.
 */
function removeUndefinedAndEmptyString(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== undefined && value !== ""));
}

export {
  generateString,
  getRandomNumber,
  randomChoice,
  randomSecret,
  randomSecretAsHex,
  randomNonce,
  log,
  toHexSeed,
  formatErrorMessage,
  generateRandomHexSeed,
  zeroPadding,
  removeUndefinedAndEmptyString,
};
