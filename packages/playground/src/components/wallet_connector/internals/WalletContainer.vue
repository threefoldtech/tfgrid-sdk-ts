<template>
  <p class="font-weight-bold mb-4">Login With TFChain Wallet Extension</p>
  <ExtensionLogin />
  <TextDivider text="OR" />

  <VTabs
    v-model="walletService.activeTab.value"
    align-tabs="center"
    color="primary"
    class="mb-6"
    mandatory
    :disabled="walletService.locked.value"
  >
    <VTab text="Login" v-if="walletService.localCredentials.value" />
    <VTab text="Connect Your Wallet" />
  </VTabs>

  <VWindow v-model="walletService.activeTab.value">
    <VWindowItem v-if="walletService.localCredentials.value">
      <WalletLogin />
    </VWindowItem>

    <VWindowItem>
      <WalletRegister />
    </VWindowItem>
  </VWindow>
</template>

<script lang="ts">
import { useWalletService } from "../../../hooks/wallet_connector";
import ExtensionLogin from "./ExtensionLogin.vue";
import TextDivider from "./TextDivider.vue";
import WalletLogin from "./WalletLogin.vue";
import WalletRegister from "./WalletRegister.vue";

export default {
  name: "WalletContainer",
  components: { WalletLogin, WalletRegister, TextDivider, ExtensionLogin },
  setup() {
    const walletService = useWalletService();

    return { walletService };
  },
};
</script>
