<template>
  <VTabs v-model="activeTab" align-tabs="center" color="primary" class="mb-6">
    <VTab text="Login" />
    <VTab text="Connect Your Wallet" />
  </VTabs>

  <VWindow v-model="activeTab">
    <VWindowItem>
      <WalletLogin />
    </VWindowItem>

    <VWindowItem>
      <WalletRegister />
    </VWindowItem>
  </VWindow>
</template>

<script lang="ts">
import { ref } from "vue";

import WalletLogin from "./WalletLogin.vue";
import WalletRegister from "./WalletRegister.vue";

export default {
  name: "WalletContainer",
  components: { WalletLogin, WalletRegister },
  setup() {
    const activeTab = ref(0);

    return { activeTab };
  },
};
</script>
