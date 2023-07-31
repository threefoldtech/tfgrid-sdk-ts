import { ApiPromise } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";
import { Decimal } from "decimal.js";

import { getKeypair } from "@/utils/signer";

export function checkAddress(address: string) {
  const keyring = new Keyring({ type: "sr25519" });
  try {
    keyring.addFromAddress(address);
    return true;
  } catch (error) {
    return false;
  }
}
export async function transfer(address: string, api: ApiPromise, target: any, amount: number, callback: any) {
  const keypair = await getKeypair();
  const nonce = await api.rpc.system.accountNextIndex(address);
  const decimalAmount = new Decimal(amount);
  const milliAmount = decimalAmount.mul(10 ** 7).toNumber();
  return api.tx.balances.transfer(target, milliAmount).signAndSend(keypair, { nonce }, callback);
}
