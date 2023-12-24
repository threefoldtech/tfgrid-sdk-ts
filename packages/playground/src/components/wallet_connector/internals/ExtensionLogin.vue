<template>
  <section>
    <VAlert type="info" text="TFChain Wallet Extension is not yet installed!" v-if="!installedTask.data">
      <template #append>
        <VBtn
          href="https://github.com/threefoldtech/tf-wallet-connector-extension?tab=readme-ov-file#threefold-wallet-connector-extension-threefoldextension"
          target="_blank"
          text="Find More"
          variant="plain"
          color="info"
          size="small"
        />
      </template>
    </VAlert>

    <template v-else>
      <VBtn
        block
        text="Login With TFChain Wallet Extension"
        size="x-large"
        color="primary"
        variant="tonal"
        @click="loginTask.run()"
        :loading="loginTask.loading"
        :disabled="walletService.locked.value && !loginTask.loading"
      >
        <template #loader>
          <VRow justify="center" align="center">
            <VProgressCircular size="20" width="2" indeterminate color="primary" />
            <span class="ml-2" v-text="loadingMessage" />
          </VRow>
        </template>
      </VBtn>

      <VFadeTransition>
        <VAlert
          type="error"
          class="mt-4"
          :text="loginTask.error"
          closable
          @click:close="resetLoginTask"
          v-if="loginTask.initialized && !loginTask.loading && loginTask.error"
        />
      </VFadeTransition>
    </template>
  </section>
</template>

<script lang="ts">
import { ThreefoldWalletConnectorApi } from "@threefold/extension_api";
import type { KeypairType } from "@threefold/grid_client";
import { onMounted, ref } from "vue";

import { network } from "../../../clients";
import { useAsync } from "../../../hooks";
import { connectAndLoginProfile, useWalletService } from "../../../hooks/wallet_connector";
import { resolveAsync } from "../../../utils/nodeSelector";

const _defaultLoadingMsg = "Loading...";

export default {
  name: "ExtensionLogin",
  setup() {
    const walletService = useWalletService();

    const loadingMessage = ref(_defaultLoadingMsg);

    const installedTask = useAsync(ThreefoldWalletConnectorApi.isInstalled, { init: true });
    const loginTask = useAsync<void, string, [mnemonic?: string, keypairType?: string]>(
      async (mnemonic, keypairType) => {
        type LoginCredentials = { mnemonic: string; keypairType: KeypairType };

        let loginCredentials = { mnemonic, keypairType } as LoginCredentials;

        if (!mnemonic || !keypairType) {
          loadingMessage.value = `Requesting to granted access permission...`;
          const [grantedAccess, e0] = await resolveAsync(ThreefoldWalletConnectorApi.requestAccess());
          if (!grantedAccess || e0) {
            throw `Failed to Granted Access Permission.`;
          }

          loadingMessage.value = `Selecting Account...`;
          const [account, e1] = await resolveAsync(ThreefoldWalletConnectorApi.selectDecryptedAccount(network));
          if (!account || e1) {
            throw `Failed to select account. Please try again.`;
          }

          loginCredentials = account as LoginCredentials;
        }

        loadingMessage.value = `Loading your wallet information...`;
        await connectAndLoginProfile(walletService, loginCredentials.mnemonic, loginCredentials.keypairType);

        walletService.extensionCredentials.set(loginCredentials.mnemonic, loginCredentials.keypairType);
      },
      {
        tries: 1,
        onBeforeTask: () => (walletService.locked.value = true),
        onAfterTask({ error }) {
          walletService.locked.value = false;

          error && setTimeout(resetLoginTask, 5_000);
          loadingMessage.value = _defaultLoadingMsg;
        },
      },
    );

    function resetLoginTask() {
      loginTask.value.initialized && !loginTask.value.loading && loginTask.value.reset();
    }

    onMounted(() => {
      const c = walletService.extensionCredentials.value;
      c && loginTask.value.run(c.mnemonic, c.keypairType);
    });

    return { walletService, installedTask, loginTask, loadingMessage, resetLoginTask };
  },
};
</script>
