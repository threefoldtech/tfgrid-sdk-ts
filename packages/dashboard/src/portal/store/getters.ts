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
  getTableLoad: state => state.tableLoad,
  getAPI: state => state.api,
<<<<<<< HEAD
  getTwinID: state => state.twinID,
=======
>>>>>>> 28377b5f (WIP: update the INode model with the missing fields, make a bind on the inputes and request to get the nodes on change.)
} as GetterTree<PortalState, PortalState>;
