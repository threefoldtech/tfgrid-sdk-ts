import { ApiPromise } from "@polkadot/api";
import { Decimal } from "decimal.js";

import { getKeypair } from "@/utils/signer";

export async function getDepositFee(api: any) {
  const fee = await api.query.tftBridgeModule.depositFee();
  const decimalFee = new Decimal(fee.toString());
  const convertedFee = decimalFee.div(10 ** 7).toNumber();
  return convertedFee;
}

export async function getWithdrawFee(api: any) {
  const fee = await api.query.tftBridgeModule.withdrawFee();
  const decimalFee = new Decimal(fee.toString());
  const convertedFee = decimalFee.div(10 ** 7).toNumber();
  return convertedFee;
}
export async function withdraw(address: string, api: ApiPromise, target: string, amount: number, callback: any) {
  try {
    const keypair = await getKeypair();
    const nonce = await api.rpc.system.accountNextIndex(address);
    const decimalAmount = new Decimal(amount);
    const milliAmount = decimalAmount.mul(10 ** 7).toNumber();
    return api.tx.tftBridgeModule.swapToStellar(target, milliAmount).signAndSend(keypair, { nonce }, callback);
  } catch (error) {
    console.log(`err while trying to get injector ${error}`);
  }
}
