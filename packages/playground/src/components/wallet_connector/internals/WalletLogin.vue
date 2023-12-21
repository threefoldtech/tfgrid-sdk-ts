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
          <VBtn
            type="button"
            variant="outlined"
            class="mr-2"
            @click="walletService.active.value = false"
            text="Close"
          />
          <VBtn type="submit" variant="tonal" color="primary" :disabled="!valid" text="Login" />
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

import { useWalletService } from "../../../hooks/wallet_connector";
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
      password.value && login();
    });

    function login() {
      const c = walletService.localCredentials.get(password.value);

      if (!c) {
        return console.log("Something went wrong - this case should be impossible");
      }

      // Login here
      console.log("login", c);
      walletService.passwordStorage.value = password.value;
    }

    return {
      walletService,
      valid,
      validatePassword,
      password,
      login,
    };
  },
};
</script>
