import Vue from "vue";
import Vuex from "vuex";

import { explorerStore } from "@/explorer/store";
import { hubStore } from "@/hub/store";
import { portalStore } from "@/portal/store";
import { credentialsStore } from "@/portal/store/credentials";

Vue.use(Vuex);

export interface Profile {
  mnemonic: string;
  ssh: string;
  twin: number;
  address: string;
}

export default new Vuex.Store<{ profile: Profile | null }>({
  state: {
    profile: null,
  },
  modules: {
    explorer: explorerStore,
    portal: portalStore,
    hub: hubStore,
    credentials: credentialsStore,
  },
});
