import { GetterTree } from "vuex";

import { PortalState } from "./state";
export default {
  getDedicatedNodes: state => {
    return state.dedicatedNodes;
  },
  getDedicatedNodesCount: state => {
    return state.dedicatedNodesCount;
  },
  accounts: (state: PortalState) => state.accounts,
  proposals: (state: PortalState) => state.proposals,
  getDedicatedNodesTablePageNumber: state => state.dedicatedNodesTablePageNumber,
  getDedicatedNodesTablePageSize: state => state.dedicatedNodesTablePageSize,
} as GetterTree<PortalState, PortalState>;
