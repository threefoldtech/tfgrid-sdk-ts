<template>
  <LoggedInLanding v-if="profileManager.profile" />
  <ConnectWalletLanding v-else />
</template>
<script lang="ts">
import { defineComponent } from "vue";

import { useProfileManager } from "../stores";
import ConnectWalletLanding from "./connect_wallet_landing.vue";
import LoggedInLanding from "./logged_in_landing.vue";
export default defineComponent({
  name: "Landing",
  components: {
    LoggedInLanding,
    ConnectWalletLanding,
  },
  setup() {
    const profileManager = useProfileManager();

    return {
      profileManager,
    };
  },
});
</script>
