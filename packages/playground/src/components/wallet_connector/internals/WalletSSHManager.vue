<template>
  <VForm>
    <CopyInputWrapper #="{ props }" :data="ssh">
      <VTextarea
        label="Public SSH Key"
        placeholder="Your Public SSh Key"
        v-bind="props"
        v-model.trim="editedSsh"
        spellcheck="false"
        :disabled="generateTask.loading || updateTask.loading"
        no-resize
        :class="{
          'ssh-input__success':
            !generateTask.loading && !updateTask.loading && !generateTask.error && !updateTask.error,
        }"
        :hint="
          generateTask.loading
            ? 'Generating a new public ssh key.'
            : updateTask.loading
            ? 'Updating your public ssh key.'
            : (generateTask.data || updateTask.data) ?? undefined
        "
        :persistent-hint="!generateTask.error && !updateTask.error"
        :error-messages="(generateTask.error || updateTask.error) ?? undefined"
        :error="!!generateTask.error || !!updateTask.error"
      />
    </CopyInputWrapper>

    <VContainer>
      <VRow justify="end">
        <VBtn
          class="mr-2"
          variant="tonal"
          color="secondary"
          text="Generate SSH Keys"
          :disabled="!!editedSsh || (walletService.locked.value && !generateTask.loading)"
          :loading="generateTask.loading"
          @click="generateTask.run()"
        />
        <VBtn
          variant="outlined"
          color="secondary"
          text="Update Public SSH Keys"
          :loading="updateTask.loading"
          :disabled="!editedSsh || ssh === editedSsh || (walletService.locked.value && !updateTask.loading)"
          @click="updateTask.run()"
        />
      </VRow>
    </VContainer>
  </VForm>
</template>

<script lang="ts">
import type { GridClient } from "@threefold/grid_client";
import { ref } from "vue";
import { generateKeyPair } from "web-ssh-keygen";

import { useAsync } from "../../../hooks";
import { useWalletService } from "../../../hooks/wallet_connector";
import { useGrid, useProfileManager } from "../../../stores";
import { storeSSH } from "../../../utils/grid";
import { downloadAsFile, normalizeError } from "../../../utils/helpers";
import { resolveAsync } from "../../../utils/nodeSelector";

export default {
  name: "WalletSSHManager",
  props: {
    ssh: { type: String, required: true },
  },
  setup(props) {
    const profileManager = useProfileManager();
    const gridStore = useGrid();
    const walletService = useWalletService();

    const generateTask = useAsync<string, string>(
      async () => {
        const [keys, e0] = await resolveAsync(
          generateKeyPair({
            alg: "RSASSA-PKCS1-v1_5",
            hash: "SHA-256",
            name: "Threefold",
            size: 4096,
          }),
        );
        if (!keys || e0) {
          throw normalizeError(e0, "Failed to generate your ssh keys.");
        }

        const [, e1] = await resolveAsync(storeSSH(gridStore.client as GridClient, keys.publicKey));
        if (e1) {
          throw normalizeError(e1, "Failed to store public generated ssh key. Please try again.");
        }

        downloadAsFile("id_rsa", keys.privateKey);
        profileManager.updateSSH(keys.publicKey);
        editedSsh.value = keys.publicKey;

        return "SSH key generated successfully.";
      },
      {
        shouldRun: () => !!gridStore.client,
        default: "",
        onBeforeTask() {
          walletService.locked.value = true;
          updateTask.value.initialized && updateTask.value.reset();
        },
        onAfterTask({ data }) {
          walletService.locked.value = false;
          data && setTimeout(generateTask.value.reset, 5_000);
        },
      },
    );

    const updateTask = useAsync<string, string>(
      async () => {
        const [, e0] = await resolveAsync(storeSSH(gridStore.client as GridClient, editedSsh.value));
        if (e0) {
          throw normalizeError(e0, "Failed to update public ssh key. Please try again.");
        }

        profileManager.updateSSH(editedSsh.value);

        return "SSH key updated successfully.";
      },
      {
        shouldRun: () => !!gridStore.client,
        default: "",
        onBeforeTask() {
          walletService.locked.value = true;
          generateTask.value.initialized && generateTask.value.reset();
        },
        onAfterTask({ data }) {
          walletService.locked.value = false;
          data && setTimeout(updateTask.value.reset, 5_000);
        },
      },
    );

    const editedSsh = ref(props.ssh);

    return { walletService, editedSsh, generateTask, updateTask };
  },
};
</script>

<style>
.ssh-input__success .v-input__details {
  color: rgb(var(--v-theme-success));
}
</style>
