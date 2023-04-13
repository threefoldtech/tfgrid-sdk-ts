import { ModuleTree } from "vuex";

import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";
import state, { PortalState } from "./state";

export const portalStore = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
} as ModuleTree<PortalState>;
