import { PortalState } from "./state";
import { GetterTree } from "vuex";
export default {
  accounts: (state: PortalState) => state.accounts,
  proposals: (state: PortalState) => state.proposals,
} as GetterTree<PortalState, PortalState>;
