import type { KeypairType, KycStatus } from "@threefold/grid_client";
import { defineStore } from "pinia";

import type { SSHKeyData } from "@/types";

import { useGrid } from "./grid";

export interface Profile {
  mnemonic: string;
  ssh: SSHKeyData[];
  twinId: number;
  address: string;
  relay: string;
  pk: string;
  keypairType: KeypairType | undefined;
  email: string;
}

export interface State {
  profile: Profile | null;
  kyc: KycStatus | null;
}

const useProfileManager = defineStore("profile-manager", {
  state: (): State => {
    return { profile: null, kyc: null };
  },

  actions: {
    set(profile: Profile | null) {
      this.profile = profile;
      useGrid().set(profile);
    },
    setKyc(kyc: KycStatus) {
      this.kyc = kyc;
    },
    updateSSH(ssh: SSHKeyData[]) {
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
    updateEmail(email: string) {
      if (this.profile) {
        this.profile.email = email;
      }
    },
    clear() {
      this.profile = null;
      useGrid().set(null);
    },
  },
});

export { useProfileManager };
