import type { KeypairType } from "@threefold/grid_client";
import { defineStore } from "pinia";

import { useGrid } from "./grid";

export interface Profile {
  mnemonic: string;
  ssh: string;
  twinId: number;
  address: string;
  relay: string;
  pk: string;
  keypairType: KeypairType | undefined;
}

interface State {
  profile: Profile | null;
}

const useProfileManager = defineStore("profile-manager", {
  state: (): State => {
    return { profile: null };
  },

  actions: {
    set(profile: Profile | null) {
      this.profile = profile;
      return useGrid().set(profile);
    },
    updateSSH(ssh: string) {
      if (this.profile) {
        this.profile.ssh = ssh;
      }
    },
    updateRelay(relay: string) {
      if (this.profile) {
        this.profile.relay = relay;
      }
    },
    updatePk(pk: string) {
      if (this.profile) {
        this.profile.pk = pk;
      }
    },
    clear() {
      this.profile = null;
    },
  },
});

export { useProfileManager };
