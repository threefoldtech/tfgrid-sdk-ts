<template>
  <section>
    <VAlert
      type="info"
      variant="tonal"
      text="You will need to provide the password used while connecting your wallet."
      class="mb-6"
    />

    <VForm v-model="valid" @submit.prevent="loginTask.run(password)" :disabled="walletService.locked.value">
      <PasswordInputWrapper #="{ props }">
        <VTextField
          label="Password"
          placeholder="Your stored wallet's password"
          :rules="[validatePassword]"
          v-bind="props"
          v-model.trim="password"
          autofocus
          :error="!!loginTask.error"
          :error-messages="loginTask.error ?? undefined"
        />
      </PasswordInputWrapper>

      <VContainer>
        <VRow justify="center">
          <VBtn
            type="button"
            variant="outlined"
            class="mr-2"
            @click="walletService.active.value = false"
            text="Close"
          />
          <VBtn
            type="submit"
            variant="tonal"
            color="primary"
            :disabled="!valid || (walletService.locked.value && !loginTask.loading)"
            text="Login"
            :loading="loginTask.loading"
          />
        </VRow>
      </VContainer>
    </VForm>

    <div class="position-relative my-6">
      <VDivider />
      <span
        class="position-absolute px-2 bg-surface"
        :style="{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }"
        v-text="'OR'"
      />
    </div>

    <ExtensionLogin />
  </section>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";

import { useAsync } from "../../../hooks";
import { connectAndLoginProfile, useWalletService } from "../../../hooks/wallet_connector";
import ExtensionLogin from "./ExtensionLogin.vue";

export default {
  name: "WalletLogin",
  components: { ExtensionLogin },
  setup() {
    const walletService = useWalletService();
    const password = ref("");

    const valid = ref<null | boolean>(null);
    function validatePassword(password?: string) {
      switch (true) {
        case !password:
          return "Password is required.";

        case password && password.length < 6:
          return "Password must be at least 6 characters.";

        case password && !walletService.localCredentials.check(password):
          return "We couldn't find a matching wallet for this password. Please connect your wallet first.";
      }

      return true;
    }

    onMounted(() => {
      password.value = walletService.passwordStorage.value || "";
      password.value && loginTask.value.run(password.value);
    });

    const loginTask = useAsync<void, string, [string]>(
      async (password: string) => {
        const credentials = walletService.localCredentials.get(password);

        // this should never happen
        if (!credentials || !credentials.mnemonic || !credentials.keypairType) {
          throw `Credentials isn't valid.`;
        }

        await connectAndLoginProfile(walletService, credentials.mnemonic, credentials.keypairType);

        walletService.passwordStorage.value = password;
      },
      {
        onBeforeTask: () => (walletService.locked.value = true),
        onAfterTask({ error }) {
          walletService.locked.value = false;
          if (error) {
            setTimeout(() => loginTask.value.initialized && loginTask.value.reset(), 5_000);
          }
        },
      },
    );

    return {
      walletService,
      valid,
      validatePassword,
      password,
      loginTask,
    };
  },
};
</script>
