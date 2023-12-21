<template>
  <section>
    <VAlert type="info" text="TFChain Wallet Extension is not yet installed.!" v-if="!installedTask.data">
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

    <VBtn
      v-else
      block
      text="Login With TFChain Wallet Extension"
      size="x-large"
      color="primary"
      variant="tonal"
      @click="loginTask.run()"
      :loading="loginTask.loading"
    />

    <VFadeTransition>
      <VAlert
        type="error"
        v-if="loginTask.initialized && !loginTask.loading && loginTask.error"
        class="mt-4"
        :text="loginTask.error"
      />
    </VFadeTransition>
  </section>
</template>

<script lang="ts">
import { type PublicAccount, ThreefoldWalletConnectorApi } from "@threefold/extension_api";

import { network } from "../../../clients";
import { useAsync } from "../../../hooks";

export default {
  name: "ExtensionLogin",
  setup() {
    const installedTask = useAsync(() => ThreefoldWalletConnectorApi.isInstalled() as Promise<boolean>, { init: true });
    const loginTask = useAsync<PublicAccount, string>(
      async () => {
        const grantedAccess = await ThreefoldWalletConnectorApi.requestAccess();
        if (!grantedAccess) {
          throw `Failed to Granted Access Permission.`;
        }

        const account = await ThreefoldWalletConnectorApi.selectDecryptedAccount(network);
        if (!account) {
          throw `Failed to select account. Please try again.`;
        }

        return account;
      },
      { tries: 1 },
    );

    return { installedTask, loginTask };
  },
};
</script>
