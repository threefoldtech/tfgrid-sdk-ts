<template>
  <div :style="{ paddingBottom: '250px' }">
    <v-alert type="info" variant="tonal">
      Connect your TFChain
      <a class="app-link" @click="$emit('openProfile')">Wallet</a>
      to view {{ pageTitle }}
    </v-alert>
    <v-alert variant="tonal" type="error">
      <tf-error-formater :error="error" />
    </v-alert>
    <v-container class="custom-container">
      <h4 class="text-center text-h4 mt-4">A Co-Owned Global Sovereign Internet</h4>
      <v-container class="d-flex justify-center">
        <p class="text-center text-subtitle w-75">
          ThreeFold is
          <strong
            >a peer-to-peer open-source Internet platform that connects users directly with local Internet
            capacity</strong
          >
          (storage, compute, and network) provided by farmers. A decentralized sovereign alternative to today’s
          centralized Internet model.
          <a href="https://threefold.io/" target="_blank" class="app-link">Find More!</a>
        </p>
      </v-container>

      <div
        :style="{
          backgroundImage: 'url(' + baseUrl + 'images/live-and-operational-background.png)',
          padding: '50px 0',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          minHeight: '850px',
        }"
      >
        <!-- class="d-flex justify-center align-center" -->
        <div class="d-flex justify-center mb-10">
          <h4 class="text-center text-h5">Live and Operational</h4>
        </div>

        <div class="d-flex flex-wrap justify-center">
          <div v-for="s in stats" :key="s.value" class="stats px-5 py-10">
            <v-card class="my-10">
              <v-img
                cover
                width="100"
                class="mx-auto"
                :src="baseUrl + 'images/icons/live-and-operational/' + s.image"
              />
              <v-card-text>
                <p class="text-center font-weight-regular text-h5">
                  {{ s.value }}
                </p>
                <p class="text-center font-weight-light text-h6">
                  {{ s.label }}
                </p>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <div class="d-flex justify-center mt-5">
          <v-btn variant="elevated" target="_blank" :href="statsUrl"> Explore ThreeFold Grid Capacity </v-btn>
        </div>
      </div>
      <div class="text-center">
        <h4 class="text-h5 mb-8">The <strong>Layer Zero</strong> for a Decentralized World</h4>
        <p class="w-75 mx-auto text-subtitle-1">
          Anything that runs on Linux can run on ThreeFold – with more security, more sustainably, and in true
          decentralization. The ThreeFold Grid can support workloads from Blockchain to Web2 to Web3 to IoT and
          Metaverse and more.
        </p>
        <div class="d-flex justify-center align-center flex-wrap my-4">
          <v-btn variant="elevated" class="mr-2" target="_blank" :href="MANUAL_URL"> Learn about the grid </v-btn>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useTheme } from "vuetify";

import { DashboardRoutes } from "@/router/routes";
import { useStatsStore } from "@/stores/stats";
export default {
  name: "ConnectWalletLanding",
  setup() {
    const theme = useTheme();
    const baseUrl = import.meta.env.BASE_URL;
    const route = useRoute();
    const pageTitle = computed(() => route.meta.title);
    const statsStore = useStatsStore();

    return {
      theme,
      pageTitle,
      DashboardRoutes,
      stats: computed(() => statsStore.stats),
      statsUrl: window.env.STATS_URL || "https://stats.grid.tf",
      baseUrl,
      error: `InsufficientBalanceError: Failed to apply {"args":{"calls":[{"args":{"key":"metadata","value":"daqvxpIHCOgggUklNZ6oPNqYz5b0d9mLoZwwC4YKU24HiRWXUnUzHmMEM97KKWthsxsU/keo/TQr6er3TFs5CgaCN4dVip/kon8ssALK2mR9cYnNtJMg3G0YTvb1lVN6LGQsVdix00AiiHMq1ni4I3Sbw6wzj0j+zOjRQVVEQxY9/EcuJ2UJzkyYpZkWNeCrOKTpzxtW7hSNbY/21nP44iVs6+HgduqoeXNZh5HfVgNgV21Ar5fEA/1sCwl7fRKOyV2VSWUdUwtkdG1BAM+2rNTXImqJB3KVMO6wb84cMIwi726mlVLd4Yk7avbN8W2qyXc="},"method":"set","section":"tfkvStore"}]},"method":"batchAll","section":"utility"} due to error: RpcError: 1010: Invalid Transaction: Inability to pay some fees , e.g. account balance too low`,
    };
  },
};
</script>

<style scoped>
.stats {
  min-width: 200px;
  max-width: 200px;
}
</style>
