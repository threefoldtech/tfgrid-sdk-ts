<template>
  <slot></slot>
</template>

<script lang="ts">
import { inject, provide, type Ref, ref } from "vue";

import type { Profile } from "@/stores/profile_manager";
import type { Balance } from "@/utils/grid";

export interface ManagerService {
  loadBalance(profile?: Profile): Promise<void>;
}
export interface ProfileManagerControllerService {
  set(manager: ManagerService): void;
  reloadBalance(): Promise<void>;
  balance: Ref<Balance | undefined>;
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
      balance: ref(),
    });
  },
};
</script>
