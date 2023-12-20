<template>
  <section>
    <VAlert
      type="info"
      variant="tonal"
      text="You will need to provide the password used while connecting your wallet."
      class="mb-6"
    />

    <VForm v-model="valid">
      <PasswordInputWrapper #="{ props }">
        <VTextField
          label="Password"
          placeholder="Your stored wallet's password"
          :rules="[v => (v ? true : 'Password is required.')]"
          v-bind="props"
          autofocus
        />
      </PasswordInputWrapper>

      <VBtn type="submit" variant="tonal" color="primary" :disabled="!valid">Login</VBtn>
    </VForm>
  </section>
</template>

<script lang="ts">
import { ref } from "vue";

export default {
  name: "WalletLogin",
  setup() {
    const valid = ref<null | boolean>(null);

    return { valid };
  },
};
</script>
