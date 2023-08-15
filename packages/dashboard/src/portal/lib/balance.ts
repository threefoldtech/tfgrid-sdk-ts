import { Keyring } from "@polkadot/keyring";
export interface balanceInterface {
  free: number;
  reserved: number;
  transferable: number;
}

export async function getBalance(api: any, address: string) {
  const res = await api.query.system.account(address);
  return {
    free: Math.floor((res.data.free.toJSON() / 1e7) * 1e7) / 1e7,
    transferable: Math.floor(((res.data.free.toJSON() - res.data.frozen.toJSON()) / 1e7) * 1000) / 1000,
    reserved: res.data.frozen.toJSON() / 1e7,
  };
}

export async function getMoreFunds(
  substrateAccountID: string,
  api: { tx: { balances: { transfer: (arg0: string, arg1: number) => any } } },
  callback: any,
) {
  const keyring = new Keyring({ type: "sr25519" });
  const alice = keyring.addFromUri("//Alice");

  const transfer = await api.tx.balances.transfer(substrateAccountID, 100 * 1e7);

  transfer.signAndSend(alice, callback);
}
