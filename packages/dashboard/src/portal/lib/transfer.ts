import { web3FromAddress } from "@polkadot/extension-dapp";
import { Keyring } from "@polkadot/keyring";

export function checkAddress(address: string) {
  const keyring = new Keyring({ type: "sr25519" });
  try {
    keyring.addFromAddress(address);
    return true;
  } catch (error) {
    return false;
  }
}
export async function transfer(
  address: string,
  api: {
    tx: {
      balances: {
        transfer: (
          arg0: any,
          arg1: number,
        ) => { (): any; new (): any; signAndSend: { (arg0: any, arg1: { signer: any }, arg2: any): any; new (): any } };
      };
    };
  },
  target: any,
  amount: number,
  callback: any,
) {
  const injector = await web3FromAddress(address);
  return api.tx.balances.transfer(target, amount * 1e7).signAndSend(address, { signer: injector.signer }, callback);
}
