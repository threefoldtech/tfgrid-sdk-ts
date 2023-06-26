import { apiInterface } from "../lib/util";
import { accountInterface, PortalState } from "./state";

import { accountInterface, PortalState } from "./state";

export enum MutationTypes {
  SET_DEDICATED_NODES = "setNodes",
  SET_DEDICATED_NODES_FILTER = "setNodesFilter",
}

export enum PortalMutationTypes {
  SET_ACCOUNTS = "setAccounts",
  REMOVE_ACCOUNTS = "removeAccounts",
  SET_PROPOSALS = "setProposals",
  SET_API = "setApi",
  SET_DEDICATED_NODES_FILTER = "setDedicatedNodesFilter",
  SET_DEDICATED_NODES_TABLE_PAGE_NUMBER = "setDedicatedNodesTablePageNumber",
  SET_DEDICATED_NODES_TABLE_PAGE_SIZE = "setDedicatedNodesTablePageSize",
  SET_TWIN_ID = "setTwinID",
  SET_TAB_QUERY = "setTabQuery",
  SET_TABLE_LOAD = "setTableLoad",
  SET_DEDICATED_NODES = "setDedicatedNodes",
  SET_DEDICATED_NODES_COUNT = "setDedicatedNodesCount",
  SET_ADDRESS = "setAddress",
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

  setApi(state: PortalState, api: apiInterface) {
    state.api = api;
  },

  setDedicatedNodesFilter(state: PortalState, payload: { key: string; value: any }) {
    state.dedicatedNodesFilter[payload.key] = payload.value;
    console.log(payload.key, state.dedicatedNodesFilter[payload.key]);
  },

  setDedicatedNodesTablePageNumber(state: PortalState, payload: number) {
    state.dedicatedNodesTablePageNumber = payload;
  },

  setDedicatedNodesTablePageSize(state: PortalState, payload: number) {
    state.dedicatedNodesTablePageSize = payload;
  },

  setTwinID(state: PortalState, payload: number) {
    state.twinID = payload;
  },

  setTabQuery(state: PortalState, payload: string) {
    state.tabQuery = payload;
  },

  setTableLoad(state: PortalState, payload: boolean) {
    state.tableLoad = payload;
  },

  setAddress(state: PortalState, address: string) {
    state.address = address;
  },

  setDedicatedNodes(state: PortalState, nodes: any[]): void {
    state.dedicatedNodes = nodes;
  },

  setDedicatedNodesCount(state: PortalState, payload: number) {
    state.dedicatedNodesCount = payload;
  },

  setNodesFilter(state: PortalState, payload: { key: string; value: any }) {
    state.dedicatedNodesFilter[payload.key] = payload.value;
    console.log(payload.key, state.dedicatedNodesFilter[payload.key]);
  },
};
