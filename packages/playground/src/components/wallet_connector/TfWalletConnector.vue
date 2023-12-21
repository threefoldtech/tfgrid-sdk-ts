<template>
  <VDialog v-model="active" scrollable min-width="60%" max-width="700px" eager>
    <template #activator="{ props }">
      <VBtn variant="flat" v-bind="props">
        <template #prepend>
          <VIcon icon="mdi-account" size="x-large" />
        </template>
        <span class="font-weight-bold">Connect your TFChain Wallet</span>

        <!-- Login -->
        <!-- <div class="text-left">
          <p class="mb-1">Balance: <span class="font-weight-bold text-secondary" v-text="'26649985954.701 TFT'" /></p>
          <p class="d-flex align-center">
            Locked: <span class="font-weight-bold text-secondary ml-2" v-text="'119.342 TFT'" />
            <VBtn
              :style="{ height: '24px', width: '24px' }"
              icon="mdi-information-outline"
              href="https://manual.grid.tf/tfchain/tfchain.html?highlight=locked#contract-locking"
              target="_blank"
              size="xs"
              color="none"
              class="ml-2"
              @click.stop
            />
          </p>
        </div> -->

        <!-- Login -->
        <!-- <template #append>
          <VBtn :style="{ height: '48px' }" icon="mdi-logout" color="error" variant="tonal" @click.stop />
        </template> -->
      </VBtn>
    </template>

    <WalletLayout>
      <WalletContainer />
    </WalletLayout>
  </VDialog>
</template>

<script lang="ts">
import { ref } from "vue";

import { $key, provideWalletService } from "../../hooks/wallet_connector";
import WalletContainer from "./internals/WalletContainer.vue";
import WalletLayout from "./internals/WalletLayout.vue";

export default {
  name: "TfWalletConnector",
  components: { WalletLayout, WalletContainer },
  setup() {
    const active = ref(false);

    provideWalletService({
      $key,
      active,
    });

    return { active };
  },
};
</script>
