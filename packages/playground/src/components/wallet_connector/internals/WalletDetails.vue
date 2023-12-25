<template>
  <VRow>
    <VCol cols="7">
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

    <VCol cols="5">
      <p class="text-center mb-4">
        Scan the QR code using
        <a
          v-text="'ThreeFold Connect'"
          target="_blank"
          href="https://manual.grid.tf/getstarted/TF_Connect/TF_Connect.html"
          class="app-link"
        />
        to fund your account
      </p>

      <VContainer>
        <VRow justify="center">
          <QrcodeGenerator :data="'TFT:' + bridge + '?message=twin_' + profile.twinId + '&sender=me&amount=100'" />
        </VRow>
      </VContainer>

      <VContainer>
        <VRow no-gutters>
          <VCol cols="6" v-for="(app, index) in apps" :key="app.url">
            <div :class="{ 'pr-1': index === 0, 'pl-1': 'index === 1' }">
              <VImg
                v-ripple
                :src="app.img"
                width="100%"
                :alt="index === 0 ? 'play-store' : 'apple-store'"
                role="button"
                @click="visitUrl(app.url)"
              />
            </div>
          </VCol>
        </VRow>
      </VContainer>
    </VCol>
  </VRow>

  <VRow justify="end" class="mt-6">
    <VBtn variant="outlined" text="Close" class="mr-2" @click="walletService.active.value = false" />
    <VBtn
      variant="tonal"
      color="error"
      text="Logout"
      @click="walletService.logout"
      :disabled="walletService.locked.value"
    />
  </VRow>
</template>

<script lang="ts">
import type { PropType } from "vue";

import { useWalletService } from "../../../hooks/wallet_connector";
import type { Profile } from "../../../stores/profile_manager";
import QrcodeGenerator from "../../qrcode_generator.vue";
import android from "./apps/android.svg";
import ios from "./apps/ios.svg";
import WalletSSHManager from "./WalletSSHManager.vue";

const bridge = window.env.BRIDGE_TFT_ADDRESS;

export default {
  name: "WalletDetails",
  components: { WalletSSHManager, QrcodeGenerator },
  props: {
    profile: {
      type: Object as PropType<Profile>,
      required: true,
    },
  },
  setup() {
    const walletService = useWalletService();

    const apps = [
      { img: android, url: "https://play.google.com/store/apps/details?id=org.jimber.threebotlogin&hl=en&gl=US" },
      { img: ios, url: "https://apps.apple.com/us/app/threefold-connect/id1459845885" },
    ];

    function visitUrl(url: string): void {
      window.open(url, "_blank");
    }

    return { walletService, bridge, apps, visitUrl };
  },
};
</script>
