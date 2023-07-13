import { ApiPromise } from "@polkadot/api";

import { getKeypair } from "@/utils/signer";

export async function getDepositFee(api: any) {
  const fee = await api.query.tftBridgeModule.depositFee();
  return fee.toNumber() / 1e7;
}

export async function getWithdrawFee(api: any) {
  const fee = await api.query.tftBridgeModule.withdrawFee();
  return fee.toNumber() / 1e7;
}
export async function withdraw(address: string, api: ApiPromise, target: string, amount: number, callback: any) {
  try {
    const keypair = await getKeypair();
    const nonce = await api.rpc.system.accountNextIndex(address);
    return api.tx.tftBridgeModule.swapToStellar(target, amount * 1e7).signAndSend(keypair, { nonce }, callback);
  } catch (error) {
    console.log(`err while trying to get injector ${error}`);
  }
}
