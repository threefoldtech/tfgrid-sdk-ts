<template>
  <VDialog v-model="active" scrollable min-width="min(94%, 1050px)" max-width="1050px" eager>
    <template #activator="{ props }">
      <VBtn variant="flat" v-bind="props">
        <template #prepend>
          <VProgressCircular indeterminate size="35" color="secondary" v-if="balanceTask.loading" />
          <VIcon v-else icon="mdi-account" size="35" />
        </template>
        <span class="font-weight-bold" v-text="'Connect your TFChain Wallet'" v-if="!gridStore.client" />

        <template v-else>
          <p class="font-weight-bold" v-text="'Loading...'" v-if="balanceTask.loading" />
          <div v-else class="text-left">
            <p class="mb-1">
              Balance: <span class="font-weight-bold text-secondary" v-text="balanceTask.data!.free + 'TFT'" />
            </p>
            <p class="d-flex align-center">
              Locked: <span class="font-weight-bold text-secondary ml-2" v-text="balanceTask.data!.frozen + 'TFT'" />
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
      <div v-show="!gridStore.client">
        <WalletContainer />
      </div>

      <WalletDetails v-if="profileManager.profile && gridStore.client" :profile="profileManager.profile" />
    </WalletLayout>
  </VDialog>
</template>

<script lang="ts">
import { ref } from "vue";

import { useAsync, useSessionStorage } from "../../hooks";
import { $key, provideWalletService, useExtensionCredentials, useLocalCredentials } from "../../hooks/wallet_connector";
import { useGrid, useProfileManager } from "../../stores";
import { normalizeBalance } from "../../utils/helpers";
import WalletContainer from "./internals/WalletContainer.vue";
import WalletDetails from "./internals/WalletDetails.vue";
import WalletLayout from "./internals/WalletLayout.vue";

export default {
  name: "TfWalletConnector",
  components: { WalletLayout, WalletContainer, WalletDetails },
  setup() {
    const gridStore = useGrid();
    const profileManager = useProfileManager();

    const active = ref(true);
    const extensionCredentials = useExtensionCredentials();
    const localCredentials = useLocalCredentials();
    const passwordStorage = useSessionStorage("password");

    const balanceTask = useAsync(
      () => new Promise(res => setTimeout(res, 1000)).then(() => gridStore.client.balance.getMyBalance()),
      {
        shouldRun: () => !!gridStore.client,
        pollingTime: 60_000,
        default: { free: "0", frozen: "0" },
        map: d => ({ free: normalizeBalance(d.free, true), frozen: normalizeBalance(d.frozen, true) }),
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
      async login(profile) {
        return profileManager.set(profile).then(balanceTask.value.startPolling);
      },
      logout,
    });

    return { gridStore, profileManager, active, logout, balanceTask };
  },
};
</script>
