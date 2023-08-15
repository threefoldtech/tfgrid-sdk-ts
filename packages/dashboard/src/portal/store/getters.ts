import { GetterTree } from "vuex";

import { PortalState } from "./state";
export default {
  getFarmNodes: state => {
    return state.farmNodes;
  },
  getDedicatedNodes: state => {
    return state.dedicatedNodes;
  },
  getDedicatedNodesCount: state => {
    return state.dedicatedNodesCount;
  },
  accounts: (state: PortalState) => state.accounts,
  proposals: (state: PortalState) => state.proposals,
  farmNodes: state => state.farmNodes,
  getDedicatedNodesTablePageNumber: state => state.dedicatedNodesTablePageNumber,
  getDedicatedNodesTablePageSize: state => state.dedicatedNodesTablePageSize,
  getTableLoad: state => state.tableLoad,
  getAPI: state => state.api,
  getTwinID: state => state.twinID,
} as GetterTree<PortalState, PortalState>;
