<template>
  <section>
    <VAlert
      type="info"
      variant="tonal"
      text="You will need to provide the password used while connecting your wallet."
      class="mb-6"
    />

    <VForm v-model="valid" @submit.prevent="login">
      <PasswordInputWrapper #="{ props }">
        <VTextField
          label="Password"
          placeholder="Your stored wallet's password"
          :rules="[validatePassword]"
          v-bind="props"
          v-model.trim="password"
        />
      </PasswordInputWrapper>

      <VContainer>
        <VRow justify="center">
          <VBtn type="button" variant="outlined" class="mr-2" @click="walletService.active.value = false">Close</VBtn>
          <VBtn type="submit" variant="tonal" color="primary" :disabled="!valid">Login</VBtn>
        </VRow>
      </VContainer>
    </VForm>
  </section>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";

import { useSessionStorage } from "../../../hooks";
import { useCredentials, useWalletService } from "../../../hooks/wallet_connector";

export default {
  name: "WalletLogin",
  setup() {
    const walletService = useWalletService();
    const passwordStorage = useSessionStorage("password");
    const credentials = useCredentials();
    const password = ref("");

    const valid = ref<null | boolean>(null);
    function validatePassword(password?: string) {
      switch (true) {
        case !password:
          return "Password is required.";

        case password && password.length < 6:
          return "Password must be at least 6 characters.";

        case password && !credentials.check(password):
          return "We couldn't find a matching wallet for this password. Please connect your wallet first.";
      }

      return true;
    }

    onMounted(() => {
      password.value = passwordStorage.value || "";
      password.value && login();
    });

    function login() {
      const mnemonic = credentials.getMnemonic(password.value);

      if (!mnemonic) {
        return console.log("Something went wrong - this case should be impossible");
      }

      // Login here
      console.log("login", mnemonic);
      passwordStorage.value = password.value;
    }

    return { walletService, valid, validatePassword, password, login };
  },
};
</script>
