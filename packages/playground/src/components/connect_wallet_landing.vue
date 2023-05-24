<template>
  <div>
    <v-alert type="info" variant="tonal">
      Please connect to your tfchain wallet <a class="app-link" @click="$emit('openProfile')">here</a>
    </v-alert>
    <div>
      <div class="d-flex justify-center mt-8 mb-10">
        <img
          :style="{
            maxWidth: '100%',
            filter: `brightness(${theme.global.name.value === 'light' ? 0.2 : 1}`,
          }"
          src="/images/logoTF.png"
          alt="logo"
        />
      </div>
      <h4 class="text-center text-h4">A Co-Owned Global Sovereign Internet</h4>
      <div class="d-flex justify-center mt-4">
        <p class="text-center" :style="{ maxWidth: '800px' }">
          ThreeFold is
          <strong
            >a peer-to-peer open-source Internet platform that connects users directly with local Internet
            capacity</strong
          >
          (storage, compute, and network) provided by farmers. A decentralized sovereign alternative to today’s
          centralized Internet model.
          <a href="https://threefold.io/" target="_blank" class="app-link">Find More!</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useTheme } from "vuetify";

export default {
  name: "ConnectWalletLanding",
  setup() {
    const theme = useTheme();

    return {
      theme,
    };
  },
};
</script>
