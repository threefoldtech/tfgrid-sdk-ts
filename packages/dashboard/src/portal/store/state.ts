import { ApiPromise } from "@polkadot/api";

import { INode } from "@/explorer/graphql/api";

export interface accountInterface {
  address: string;
  meta: { genesisHash: string; name: string; source: string };
  type: string;
  active: boolean;
}

export interface PortalState {
  accounts: accountInterface[];
  dedicatedNodes: INode[];
  proposals: number;
  api: ApiPromise;
  dedicatedNodesFilter: any;
}
export default {
  accounts: [],
  dedicatedNodes: [],
  proposals: 0,
  api: undefined,
  dedicatedNodesFilter: {},
};
