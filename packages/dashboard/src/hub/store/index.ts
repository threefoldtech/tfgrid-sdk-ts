import { checkKeplr } from "../utils/checkKeplr";
import { Config, loadConfig } from "../utils/config";
import Vue from "vue";
import Vuex, { ActionContext, ModuleTree } from "vuex";

Vue.use(Vuex);

export enum Actions {
  CHECK_KEPLR = "hub/checkKeplr",
}

export enum Keplr {
  LOADING = "loading",
  ERROR = "error",
  LOADED = "loaded",
}

interface IState {
  config: Config;
  keplr: Keplr;
}

export const hubStore = {
  namespaced: true,
  state: {
    config: loadConfig(),
    keplr: Keplr.LOADING,
  },
  actions: {
    checkKeplr({ state }: ActionContext<IState, IState>) {
      checkKeplr()
        .then(() => {
          state.keplr = Keplr.LOADED;
        })
        .catch(() => {
          state.keplr = Keplr.ERROR;
        });
    },
  },
} as ModuleTree<IState>;
