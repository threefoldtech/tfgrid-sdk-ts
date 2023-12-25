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
            <p class="mb-1">Balance: <span class="font-weight-bold text-secondary" v-text="balance.free + 'TFT'" /></p>
            <p class="d-flex align-center">
              Locked: <span class="font-weight-bold text-secondary ml-2" v-text="balance.frozen + 'TFT'" />
              <VTooltip text="Locked balance documentation">
                <template #activator="{ props }">
                  <VBtn
                    :style="{ height: '24px', width: '24px' }"
                    icon="mdi-information-outline"
                    href="https://manual.grid.tf/tfchain/tfchain.html?highlight=locked#contract-locking"
                    target="_blank"
                    size="xs"
                    color="none"
                    class="ml-2 text-white"
                    @click.stop
                    v-bind="props"
                  />
                </template>
              </VTooltip>
            </p>
          </div>
        </template>

        <template #append v-if="gridStore.client">
          <VTooltip text="Logout">
            <template #activator="{ props }">
              <VBtn
                :style="{ height: '48px' }"
                icon="mdi-logout"
                color="error"
                variant="tonal"
                @click.stop="logout"
                :disabled="walletService.locked.value"
                v-bind="props"
              />
            </template>
          </VTooltip>
        </template>
      </VBtn>
    </template>

    <WalletLayout>
      <WalletContainer v-if="!gridStore.client" />
      <WalletDetails v-if="profileManager.profile && gridStore.client" :profile="profileManager.profile" />
    </WalletLayout>
  </VDialog>
</template>

<script lang="ts">
import { ref } from "vue";

import { useApp, useAsync, useSessionStorage } from "../../hooks";
import { $key, provideWalletService, useExtensionCredentials, useLocalCredentials } from "../../hooks/wallet_connector";
import { useGrid, useProfileManager } from "../../stores";
import { normalizeBalance } from "../../utils/helpers";
import WalletContainer from "./internals/WalletContainer.vue";
import WalletDetails from "./internals/WalletDetails.vue";
import WalletLayout from "./internals/WalletLayout.vue";

export default {
  name: "TfWalletConnector",
  components: { WalletLayout, WalletContainer, WalletDetails },
  setup(_, ctx) {
    const gridStore = useGrid();
    const profileManager = useProfileManager();
    const app = useApp();

    const active = ref(true);
    const extensionCredentials = useExtensionCredentials();
    const localCredentials = useLocalCredentials();
    const passwordStorage = useSessionStorage("password");

    const balance = ref({ free: "0", frozen: "0" });
    const balanceTask = useAsync(
      () => new Promise(res => setTimeout(res, 1000)).then(() => gridStore.client.balance.getMyBalance()),
      {
        shouldRun: () => !!gridStore.client,
        pollingTime: 60_000,
        map: d => ({ free: normalizeBalance(d.free, true), frozen: normalizeBalance(d.frozen, true) }),
        onAfterTask({ data }) {
          if (data) {
            balance.value = data;
          }
        },
      },
    );

    function logout() {
      profileManager.set(null);
      extensionCredentials.remove();
      passwordStorage.remove();
      balanceTask.value.stopPolling();
      balance.value = { free: "0", frozen: "0" };
      activeTab.value = 0;
    }

    const locked = ref(false);
    const activeTab = ref(0);

    const walletService = provideWalletService(app, {
      $key,
      active,
      extensionCredentials,
      localCredentials,
      passwordStorage,
      async login(profile) {
        return profileManager.set(profile).then(balanceTask.value.startPolling);
      },
      logout,
      locked,
      activeTab,
      reloadBalance() {
        return balanceTask.value.run();
      },
    });

    ctx.expose(walletService);

    return { walletService, gridStore, profileManager, active, logout, balanceTask, balance };
  },
};
</script>
