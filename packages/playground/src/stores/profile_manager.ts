import { defineStore } from "pinia";

export interface Profile {
  mnemonic: string;
  ssh: string;
  twinId: number;
  address: string;
  relay: string;
  pk: string;
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
