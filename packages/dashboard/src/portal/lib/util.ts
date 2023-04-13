import { Signer } from "@polkadot/api/types";
export interface apiInterface {
  query: {
    system: { account: (arg0: string) => { data: any } };
    tftPriceModule: { tftPrice: () => { words: [0] } };
    smartContractModule: { activeNodeContracts: (arg0: any) => any };
    tfgridModule: { pricingPolicies: (arg0: number) => any };
  };
  tx: {
    smartContractModule: {
      createRentContract: (
        arg0: any,
        arg1: any,
      ) => {
        (): any;
        new (): any;
        signAndSend: {
          (arg0: any, arg1: { signer: Signer }, arg2: any): any;
          new (): any;
        };
      };
      cancelContract: (arg0: any) => {
        (): any;
        new (): any;
        signAndSend: {
          (arg0: any, arg1: { signer: Signer }, arg2: any): any;
          new (): any;
        };
      };
    };
  };
}
export function hex2a(hex: string) {
  if (!hex) return "";
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    const v = parseInt(hex.substr(i, 2), 16);
    if (v) str += String.fromCharCode(v);
  }
  return str;
}
