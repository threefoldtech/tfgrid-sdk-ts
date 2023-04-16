import { ModuleTree } from "vuex";

import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";
import state from "./state";
import { IState } from "./state";

export const explorerStore = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
} as ModuleTree<IState>;
