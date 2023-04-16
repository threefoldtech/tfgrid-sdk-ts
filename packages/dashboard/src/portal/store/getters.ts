import { GetterTree } from "vuex";

import { PortalState } from "./state";
export default {
  accounts: (state: PortalState) => state.accounts,
  proposals: (state: PortalState) => state.proposals,
} as GetterTree<PortalState, PortalState>;
