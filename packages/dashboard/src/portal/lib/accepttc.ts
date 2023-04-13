import { Signer } from "@polkadot/api/types";
import { web3FromAddress } from "@polkadot/extension-dapp";

export async function acceptTermsAndCondition(
  api: {
    tx: {
      tfgridModule: {
        userAcceptTc: (
          arg0: string,
          arg1: string,
        ) => {
          (): any;
          new (): any;
          signAndSend: { (arg0: string, arg1: { signer: Signer }, arg2: any): any; new (): any };
        };
      };
    };
  },
  address: string,
  documentLink: string,
  documentHash: string,
  callback: any,
) {
  const injector = await web3FromAddress(address);
  return api.tx.tfgridModule
    .userAcceptTc(documentLink, documentHash)
    .signAndSend(address, { signer: injector.signer }, callback);
}

export async function userAcceptedTermsAndConditions(
  api: { query: { tfgridModule: { usersTermsAndConditions: (arg0: string) => any } } },
  address: string,
) {
  const tcs = await api.query.tfgridModule.usersTermsAndConditions(address);
  const parsedTcs = tcs.toJSON();
  return parsedTcs ? true : false;
}
