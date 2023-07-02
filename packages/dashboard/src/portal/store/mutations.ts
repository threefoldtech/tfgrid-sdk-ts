import { ApiPromise } from "@polkadot/api";

import { accountInterface, PortalState } from "./state";

import { apiInterface } from "../lib/util";

export enum MutationTypes {
  SET_DEDICATED_NODES = "setNodes",
  SET_DEDICATED_NODES_FILTER = "setNodesFilter",
  SET_DEDICATED_NODES_TABLE_PAGE_NUMBER = "setDedicatedNodesTablePageNumber",
  SET_DEDICATED_NODES_TABLE_PAGE_SIZE = "setDedicatedNodesTablePageSize",
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

  setDedicatedNodesTablePageNumber(state: PortalState, payload: number) {
    state.dedicatedNodesTablePageNumber = payload;
  },
  setDedicatedNodesTablePageSize(state: PortalState, payload: number) {
    state.dedicatedNodesTablePageSize = payload;
  },
};
