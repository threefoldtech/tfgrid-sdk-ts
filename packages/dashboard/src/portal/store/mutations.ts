import { ApiPromise } from "@polkadot/api";

import { accountInterface, PortalState } from "./state";

export enum MutationTypes {
  SET_DEDICATED_NODES = "setNodes",
  SET_DEDICATED_NODES_FILTER = "setNodesFilter",
}

export enum PortalMutationTypes {
  SET_ACCOUNTS = "setAccounts",
}
export default {
  setAccounts(state: PortalState, payload: { accounts: accountInterface[] }) {
    state.accounts = payload.accounts;
  },
  removeAccounts(state: PortalState) {
    state.accounts = [];
  },
  setProposals(state: PortalState, payload: { proposals: number }) {
    state.proposals = payload.proposals;
  },
  setApi(state: PortalState, payload: { api: ApiPromise }) {
    state.api = payload.api;
  },

  setNodesFilter(state: PortalState, payload: { key: string; value: any }) {
    state.dedicatedNodesFilter[payload.key] = payload.value;
    console.log(payload.key, state.dedicatedNodesFilter[payload.key]);
  },
};
