import state from "./state";
import actions from "./actions";
import mutations from "./mutations";
import getters from "./getters";
import { IState } from "./state";
import { ModuleTree } from "vuex";

export const explorerStore = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
} as ModuleTree<IState>;
