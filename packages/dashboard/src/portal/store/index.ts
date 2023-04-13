import state, { PortalState } from "./state";
import actions from "./actions";
import mutations from "./mutations";
import getters from "./getters";
import { ModuleTree } from "vuex";

export const portalStore = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
} as ModuleTree<PortalState>;
