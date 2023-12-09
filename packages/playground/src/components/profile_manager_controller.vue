<template>
  <slot></slot>
</template>

<script lang="ts">
import { inject, provide } from "vue";

import type { Profile } from "@/stores/profile_manager";

export interface ManagerService {
  loadBalance(profile?: Profile): Promise<void>;
}
export interface ProfileManagerControllerService {
  set(manager: ManagerService): void;
  reloadBalance(): Promise<void>;
}
const key = "profile:manager:controller";
export function useProfileManagerController() {
  return inject(key) as ProfileManagerControllerService;
}
export default {
  name: "ProfileManagerController",
  setup() {
    let m: ManagerService;
    provide(key, {
      set(manager: ManagerService) {
        m = manager;
      },
      reloadBalance() {
        return m?.loadBalance();
      },
    });
  },
};
</script>
