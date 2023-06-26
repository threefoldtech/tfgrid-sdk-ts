import { ApiPromise } from "@polkadot/api";
export interface accountInterface {
  address: string;
  meta: { genesisHash: string; name: string; source: string };
  type: string;
  active: boolean;
}

export interface PortalState {
  accounts: accountInterface[];
  proposals: number;
  api: ApiPromise;
  dedicatedNodesFilter: any;
}
export default {
  accounts: [],
  proposals: 0,
  api: undefined,
  dedicatedNodesFilter: {},
};
