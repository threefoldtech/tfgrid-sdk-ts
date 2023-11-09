import { mnemonicToMiniSecret } from "@polkadot/util-crypto";
import { validateMnemonic } from "bip39";
import { Buffer } from "buffer";
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

export { generateString, getRandomNumber, randomChoice, randomSecret, randomSecretAsHex, randomNonce, log, toHexSeed };
