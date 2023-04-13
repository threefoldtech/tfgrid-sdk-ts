import { ApiPromise } from "@polkadot/api";
import { PortalState } from "./state";

export enum PortalMutationTypes {
  SET_ACCOUNTS = "setAccounts",
}
export default {
  setAccounts(state: PortalState, payload: { accounts: [] }) {
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
};
