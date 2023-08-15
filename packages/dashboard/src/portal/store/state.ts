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
  address: string;
  tabQuery: string;
  tableLoad: boolean;
  twinID: number;
  farmNodes: INode[];
  dedicatedNodesFilter: any;
  dedicatedNodesTablePageSize: number;
  dedicatedNodesTablePageNumber: number;
  dedicatedNodesCount: number;
}
export default {
  accounts: [],
  dedicatedNodes: [],
  proposals: 0,
  api: undefined,
  address: "",
  tabQuery: "",
  tableLoad: false,
  twinID: 0,
  farmNodes: [],
  dedicatedNodesFilter: {},
  dedicatedNodesTablePageSize: 10,
  dedicatedNodesTablePageNumber: 1,
  dedicatedNodesCount: 0,
};
