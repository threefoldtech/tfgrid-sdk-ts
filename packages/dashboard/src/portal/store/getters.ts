import { GetterTree } from "vuex";

import { PortalState } from "./state";
export default {
  accounts: (state: PortalState) => state.accounts,
  proposals: (state: PortalState) => state.proposals,
  getDedicatedNodesTablePageNumber: state => state.dedicatedNodesTablePageNumber,
  getDedicatedNodesTablePageSize: state => state.dedicatedNodesTablePageSize,
} as GetterTree<PortalState, PortalState>;
