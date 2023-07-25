import { ApiPromise } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";

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
  return api.tx.balances.transfer(target, amount * 1e7).signAndSend(keypair, { nonce }, callback);
}
