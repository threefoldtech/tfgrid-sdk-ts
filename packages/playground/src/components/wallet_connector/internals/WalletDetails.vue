<template>
  <VContainer>
    <VRow>
      <VCol cols="8">
        <PasswordInputWrapper #="{ props }">
          <VTextField label="Your Mnemonic" :model-value="profile.mnemonic" readonly v-bind="props" />
        </PasswordInputWrapper>

        <WalletSSHManager :ssh="profile.ssh" />

        <CopyInputWrapper #="{ props }" :data="profile.twinId.toString()">
          <VTextField class="mt-4" label="Twin ID" :model-value="profile.twinId" v-bind="props" readonly />
        </CopyInputWrapper>

        <CopyInputWrapper #="{ props }" :data="profile.address">
          <VTextField label="Address" :model-value="profile.address" v-bind="props" readonly />
        </CopyInputWrapper>
      </VCol>

      <VDivider vertical />

      <VCol cols="4">a</VCol>
    </VRow>
  </VContainer>

  <VContainer>
    <VRow justify="end">
      <VBtn variant="outlined" text="Close" class="mr-2" @click="walletService.active.value = false" />
      <VBtn variant="tonal" color="error" text="Logout" @click="walletService.logout" />
    </VRow>
  </VContainer>
</template>

<script lang="ts">
import type { PropType } from "vue";

import { useWalletService } from "../../../hooks/wallet_connector";
import type { Profile } from "../../../stores/profile_manager";
import WalletSSHManager from "./WalletSSHManager.vue";

export default {
  name: "WalletDetails",
  components: { WalletSSHManager },
  props: {
    profile: {
      type: Object as PropType<Profile>,
      required: true,
    },
  },
  setup() {
    const walletService = useWalletService();

    return { walletService };
  },
};
</script>
