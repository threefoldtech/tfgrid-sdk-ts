import { KYC as KycClient, KycStatus } from "@threefold/grid_client";
import { defineStore } from "pinia";

import type { Profile } from "./profile_manager";

interface KYC {
  status: KycStatus | null;
  client: KycClient | null;
}

const useKYC = defineStore("KYC-client", {
  state: (): KYC => {
    return { status: null, client: null };
  },

  actions: {
    async init(profile: Profile, domain: string) {
      if (!profile) {
        this.status = null;
        this.client = null;
        return;
      }
      try {
        this.client = new KycClient(domain, profile.mnemonic, profile.keypairType);
      } catch (error) {
        console.error("Failed to initialize KYC client:", error);
        this.status = null;
        this.client = null;
      }
      await this._setStatus();
    },
    async _setStatus() {
      if (this.client) {
        try {
          this.status = await this.client.status();
        } catch (error) {
          console.error("Failed to fetch KYC status:", error);
          this.status = null;
        }
      }
    },
  },
});

export { useKYC };
