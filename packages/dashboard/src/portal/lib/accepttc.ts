import type { ApiPromise } from "@polkadot/api";

import { getKeypair } from "@/utils/signer";

export async function acceptTermsAndCondition(
  api: ApiPromise,
  address: string,
  documentLink: string,
  documentHash: string,
  callback: any,
) {
  const keypair = await getKeypair();
  const nonce = await api.rpc.system.accountNextIndex(address);
  const extrinsic = api.tx.tfgridModule.userAcceptTc(documentLink, documentHash);
  return extrinsic.signAndSend(keypair, { nonce }, callback);
}

export async function userAcceptedTermsAndConditions(
  api: { query: { tfgridModule: { usersTermsAndConditions: (arg0: string) => any } } },
  address: string,
) {
  const tcs = await api.query.tfgridModule.usersTermsAndConditions(address);
  const parsedTcs = tcs.toJSON();
  return parsedTcs ? true : false;
}
