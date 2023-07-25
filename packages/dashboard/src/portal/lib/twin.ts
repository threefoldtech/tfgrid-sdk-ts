import { ApiPromise } from "@polkadot/api";

import { getKeypair } from "@/utils/signer";

export async function createTwin(address: string, api: ApiPromise, relay: string, pk: string | null, callback: any) {
  const keypair = await getKeypair();
  const nonce = await api.rpc.system.accountNextIndex(address);
  return api.tx.tfgridModule.createTwin(relay, pk).signAndSend(keypair, { nonce }, callback);
}
export async function getTwin(api: { query: { tfgridModule: { twins: (arg0: number) => any } } }, id: number) {
  const twin = await api.query.tfgridModule.twins(id);
  return twin.toJSON();
}
export async function getTwinID(
  api: { query: { tfgridModule: { twinIdByAccountID: (arg0: string) => any } } },
  accountID: string,
) {
  const twin = await api.query.tfgridModule.twinIdByAccountID(accountID);
  return twin.toJSON();
}
export async function updateRelay(address: string, api: ApiPromise, relay: string, pk: string | null, callback: any) {
  const keypair = await getKeypair();
  const nonce = await api.rpc.system.accountNextIndex(address);
  return api.tx.tfgridModule.updateTwin(relay, pk).signAndSend(keypair, { nonce }, callback);
}
export async function deleteTwin(address: string, api: ApiPromise, twinID: string, callback: any) {
  const keypair = await getKeypair();
  const nonce = await api.rpc.system.accountNextIndex(address);
  return api.tx.tfgridModule.deleteTwin(twinID).signAndSend(keypair, { nonce }, callback);
}
