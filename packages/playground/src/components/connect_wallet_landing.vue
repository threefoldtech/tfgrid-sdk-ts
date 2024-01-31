<template>
  <div :style="{ paddingBottom: '250px' }">
    <v-alert type="info" variant="tonal">
      Connect your TFChain
      <a class="app-link" @click="$emit('openProfile')">Wallet</a>
      to view {{ pageTitle }}
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
          <v-btn color="primary" target="_blank" :href="statsUrl"> Explore ThreeFold Grid Capacity </v-btn>
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
          <v-btn
            color="secondary"
            variant="outlined"
            class="mr-2"
            target="_blank"
            href="https://www.threefold.io/grid/"
          >
            Learn about the grid
          </v-btn>
          <v-btn color="primary" target="_blank" href="https://www.threefold.io/build/"> Use The Grid </v-btn>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTheme } from "vuetify";

import { useRequestStore } from "@/stores/stats";

export default {
  name: "ConnectWalletLanding",
  setup() {
    const theme = useTheme();
    const baseUrl = import.meta.env.BASE_URL;
    const route = useRoute();
    const $router = useRouter();
    const statsStore = useRequestStore();
    const pageTitle = computed(() => route.meta.title);
    return {
      theme,
      statsUrl: window.env.STATS_URL || "https://stats.grid.tf",
      pageTitle,
      stats: [
        {
          label: "Capacity",
          value: statsStore.data.capacity,
          image: "capacity.png",
        },
        {
          label: "Nodes",
          value: statsStore.data.nodes,
          image: "nodes.png",
        },
        {
          label: "Countries",
          value: statsStore.data.countries,
          image: "countries.png",
        },
        {
          label: "Cores",
          value: statsStore.data.cores,
          image: "cores.png",
        },
      ],
      baseUrl,
      $router,
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
