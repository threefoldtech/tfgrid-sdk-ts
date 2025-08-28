<template>
  <v-container fluid class="d-flex flex-column align-center justify-center px-2 px-sm-4 px-md-6">
    <VRow>
      <VCol cols="12">
        <v-card class="pa-2 pa-sm-4 pa-md-6">
          <VCardTitle class="px-2 px-sm-4">
            <h4 class="text-center text-h6 text-sm-h6 text-md-h5 text-lg-h4 font-weight-bold">
              Welcome to ThreeFold Dashboard!
            </h4>
            <h5 class="text-center text-subtitle-1 text-sm-h6 text-md-h5 text-lg-h5 my-2">
              A Co-Owned Global Sovereign Internet
            </h5>
          </VCardTitle>
          <VCardText class="px-2 px-sm-4">
            <p
              class="home_text text-center text-body-2 text-sm-subtitle-1 text-md-subtitle-1 w-75 w-sm-75 w-md-75 w-lg-75 mx-auto"
            >
              ThreeFold is a peer-to-peer open-source Internet platform that connects users directly with local Internet
              capacity (storage, compute, and network) provided by farmers. A decentralized sovereign alternative to
              today's centralized Internet model.
              <a href="https://threefold.io/" target="_blank" class="app-link">Find More</a>!
            </p>
          </VCardText>
          <v-card-actions class="px-2 px-sm-4 pb-4">
            <v-btn
              v-if="!profileManager.profile"
              variant="elevated"
              class="ma-auto w-100 w-sm-auto"
              size="large"
              @click="$emit('openProfile')"
            >
              <span class="d-none d-sm-inline">Connect your TFChain Wallet</span>
              <span class="d-sm-none">Connect Wallet</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </VCol>
    </VRow>
    <div
      :style="{
        backgroundImage: 'url(' + baseUrl + 'images/map_white.png)',
        padding: '10px',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        height: 'auto',
      }"
      class="w-100"
    >
      <v-container class="d-flex justify-center flex-column align-center px-2 px-sm-4">
        <h4 class="text-center text-h6 text-sm-h5 text-md-h4 text-lg-h4 my-2 my-sm-4">Live and Operational</h4>
        <p
          class="home_text text-center text-body-2 text-sm-subtitle-1 text-md-subtitle-1 w-75 w-sm-75 w-md-75 w-lg-75 mx-auto mb-2 mb-sm-3"
        >
          ThreeFold's groundbreaking technology enables anyone - individuals,<br class="d-none d-sm-block" />
          organizations, and communities - to deploy their own internet infrastructure.
        </p>

        <p
          class="home_text text-center text-body-2 text-sm-subtitle-1 text-md-subtitle-1 w-75 w-sm-75 w-md-75 w-lg-75 mx-auto"
        >
          Today, our proof-of-concept network is live and operational worldwide, running on
          <br class="d-none d-sm-block" />version 3.17 technology.
        </p>
      </v-container>

      <v-container class="px-2 px-sm-4">
        <div class="d-flex flex-column">
          <v-row class="justify-center items-center mx-0 mx-sm-2 mx-lg-10">
            <v-col v-for="s in stats" :key="s.value" cols="6" sm="6" md="3" lg="3" class="stats px-1 px-sm-2 px-md-3">
              <v-card class="mt-2 stats-card" elevation="2">
                <v-card-text class="card_stats pa-3 pa-sm-4">
                  <p class="text-center text-caption text-sm-body-2 font-weight-light sub-header mb-1">
                    {{ s.label }}
                  </p>
                  <p class="text-center tf-header font-weight-bold mb-0">
                    {{ s.value }}
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" class="mt-3">
              <p
                class="home_text text-center text-body-2 text-sm-subtitle-1 text-md-subtitle-1 w-75 w-sm-75 w-md-75 w-lg-75 mx-auto"
              >
                As we expand, we may need millions of nodes to support this growing ecosystem to build a
                <br class="d-none d-sm-block" />
                truly decentralized and resilient infrastructure
              </p>
              <div class="d-flex justify-center align-center flex-column flex-sm-row flex-wrap my-4">
                <v-btn
                  variant="outlined"
                  class="text-secondary w-100 w-sm-auto"
                  size="large"
                  target="_blank"
                  :href="statsUrl"
                >
                  Explore ThreeFold Grid Capacity
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </div>

    <div class="text-center my-4 my-sm-8 px-2 px-sm-4">
      <h4 class="text-h6 text-sm-h5 text-md-h4 mb-2 mb-sm-4">
        The <strong>Layer Zero</strong> for a Decentralized World
      </h4>
      <p class="home_text w-75 w-sm-75 w-md-75 w-lg-75 mx-auto text-body-2 text-sm-subtitle-1 text-md-subtitle-1">
        Anything that runs on Linux can run on ThreeFold – with more security, more sustainably, and in true
        decentralization. The ThreeFold Grid can support workloads from Blockchain to Web2 to Web3 to IoT and Metaverse
        and more.
      </p>
      <div class="d-flex justify-center align-center flex-column flex-sm-row flex-wrap my-4">
        <v-btn
          variant="outlined"
          class="text-secondary w-100 w-sm-auto"
          size="large"
          target="_blank"
          :href="MANUAL_URL"
        >
          Learn about the grid
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useTheme } from "vuetify";

import { DashboardRoutes } from "@/router/routes";
import { useStatsStore } from "@/stores/stats";
import { useProfileManager } from "@/stores";

export default {
  name: "ConnectWalletLanding",
  emits: ["openProfile"],
  setup() {
    const theme = useTheme();
    const baseUrl = import.meta.env.BASE_URL;
    const route = useRoute();
    const pageTitle = computed(() => route.meta.title);
    const statsStore = useStatsStore();
    const profileManager = useProfileManager();

    return {
      theme,
      pageTitle,
      DashboardRoutes,
      stats: computed(() => statsStore.stats),
      statsUrl: window.env.STATS_URL,
      MANUAL_URL: window.env.MANUAL_URL,
      baseUrl,
      profileManager,
    };
  },
};
</script>

<style scoped>
.tf-header {
  font-size: 1.1rem;
  line-height: 1.2;
}
.card_stats {
  padding: 1rem 0.4rem;
}
.stats-card {
  border-radius: 8px;
  transition: transform 0.2s ease;
  background-color: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.stats-card:hover {
  transform: translateY(-2px);
  background-color: rgba(255, 255, 255, 0.25) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

@media only screen and (max-width: 600px) {
  .v-col {
    flex-basis: auto !important;
  }

  .home_text {
    width: auto !important;
  }

  .tf-header {
    font-size: 0.9rem;
  }

  .card_stats {
    padding: 0.75rem 0.25rem;
  }
}

@media (max-width: 480px) {
  .v-container {
    padding: 4px;
  }

  .tf-header {
    font-size: 0.85rem;
  }

  .card_stats {
    padding: 0.5rem 0.2rem;
  }
}

@media (max-width: 375px) {
  .v-container {
    padding: 2px;
  }

  .tf-header {
    font-size: 0.8rem;
  }

  .card_stats {
    padding: 0.4rem 0.15rem;
  }
}

@media (max-width: 320px) {
  .tf-header {
    font-size: 0.75rem;
  }

  .card_stats {
    padding: 0.3rem 0.1rem;
  }
}
</style>
