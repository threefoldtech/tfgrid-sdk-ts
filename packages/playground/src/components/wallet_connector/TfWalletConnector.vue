<template>
  <VDialog v-model="active" scrollable min-width="min(90%, 900px)" max-width="900px" eager>
    <template #activator="{ props }">
      <VBtn variant="flat" v-bind="props">
        <template #prepend>
          <VIcon icon="mdi-account" size="x-large" />
        </template>
        <span class="font-weight-bold" v-text="'Connect your TFChain Wallet'" v-if="!gridStore.client" />

        <template v-else>
          <div class="text-left">
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
                class="ml-2 text-white"
                @click.stop
              />
            </p>
          </div>
        </template>

        <template #append v-if="gridStore.client">
          <VBtn :style="{ height: '48px' }" icon="mdi-logout" color="error" variant="tonal" @click.stop="logout" />
        </template>
      </VBtn>
    </template>

    <WalletLayout>
      <WalletContainer />
    </WalletLayout>
  </VDialog>
</template>

<script lang="ts">
import { ref } from "vue";

import { useAsync, useSessionStorage } from "../../hooks";
import { $key, provideWalletService, useExtensionCredentials, useLocalCredentials } from "../../hooks/wallet_connector";
import { useGrid, useProfileManager } from "../../stores";
import type { Profile } from "../../stores/profile_manager";
import WalletContainer from "./internals/WalletContainer.vue";
import WalletLayout from "./internals/WalletLayout.vue";

export default {
  name: "TfWalletConnector",
  components: { WalletLayout, WalletContainer },
  setup() {
    const gridStore = useGrid();
    const profileManager = useProfileManager();

    const active = ref(false);
    const extensionCredentials = useExtensionCredentials();
    const localCredentials = useLocalCredentials();
    const passwordStorage = useSessionStorage("password");
    const balanceTask = useAsync(
      async () => {
        console.log(await gridStore.client.balance.getMyBalance());

        return true;
      },
      {
        shouldRun: () => !!gridStore.client,
        pollingTime: 5_000,
      },
    );

    function logout() {
      profileManager.set(null);
      extensionCredentials.remove();
      localCredentials.remove();
      passwordStorage.remove();
      balanceTask.value.stopPolling();
    }

    provideWalletService({
      $key,
      active,
      extensionCredentials,
      localCredentials,
      passwordStorage,
      login(profile) {
        profileManager.set(profile);
      },
      logout,
    });

    return { gridStore, active, logout };
  },
};
</script>
