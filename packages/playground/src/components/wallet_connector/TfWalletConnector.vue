<template>
  <VDialog v-model="active" scrollable min-width="60%" max-width="700px" eager>
    <template #activator="{ props }">
      <VBtn variant="flat" v-bind="props">
        <template #prepend>
          <VIcon icon="mdi-check" />
        </template>
        <span>Connect your TFChain Wallet</span>
      </VBtn>
    </template>

    <WalletLayout>
      <WalletContainer />
    </WalletLayout>
  </VDialog>
</template>

<script lang="ts">
import { ref } from "vue";

import { provideWalletService } from "../../hooks/wallet_connector";
import WalletContainer from "./internals/WalletContainer.vue";
import WalletLayout from "./internals/WalletLayout.vue";

export default {
  name: "TfWalletConnector",
  components: { WalletLayout, WalletContainer },
  setup() {
    const active = ref(false);

    provideWalletService({
      active,
    });

    return { active };
  },
};
</script>
