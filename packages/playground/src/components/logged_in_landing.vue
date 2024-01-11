<template>
  <v-container fluid>
    <v-row>
      <v-col lg="6" md="12" class="border mt-3">
        <div>
          <div class="d-flex justify-center mb-5">
            <h4 class="tf-header">Live and Operational</h4>
          </div>
          <div
            :style="{
              backgroundImage: 'url(' + baseUrl + 'images/live-and-operational-background.png)',

              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              minHeight: '450px',
            }"
          />
          <div class="d-flex flex-wrap justify-space-between align-end" style="statcards">
            <div v-for="s in stats" :key="s.value" class="stats px-2">
              <v-card class="my-10">
                <v-img
                  cover
                  width="100"
                  class="mx-auto"
                  :src="baseUrl + 'images/icons/live-and-operational/' + s.image"
                />
                <v-card-text>
                  <p class="text-center tf-header font-weight-regular mb-2">{{ s.value }}</p>
                  <p class="text-center font-weight-light sub-header">{{ s.label }}</p>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </div>
      </v-col>
      <v-col lg="6" md="12" class="d-flex flex-wrap">
        <v-row>
          <v-col :lg="6" :md="12" v-for="card in cards" :key="card.path">
            <v-hover>
              <template v-slot:default="{ isHovering, props }">
                <v-card
                  class="px-3 py-3 border"
                  v-bind="props"
                  :height="'165px'"
                  :class="isHovering ? 'card-opacity' : undefined"
                  @click="$router.push(card.path)"
                >
                  <v-card-title class="d-flex align-items-baseline"
                    ><v-icon class="mr-3">{{ card.icon }}</v-icon
                    >{{ card.title }}</v-card-title
                  >
                  <v-card-text>{{ card.text }}</v-card-text>
                </v-card>
              </template>
            </v-hover>
          </v-col>
        </v-row>
        <v-row>
          <v-card class="mt-3 py-2 border mx-3">
            <div class="text-center">
              <v-card-title> The <strong>Layer Zero</strong> for a Decentralized World </v-card-title>
              <p class="w-75 mx-auto">
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
          </v-card>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTheme } from "vuetify";

import { useProfileManager } from "../stores";
export default {
  name: "LoggedInLanding",
  setup() {
    const theme = useTheme();
    const baseUrl = import.meta.env.BASE_URL;
    const route = useRoute();
    const $router = useRouter();
    const pageTitle = computed(() => route.meta.title);
    const profileManager = useProfileManager();

    const cards = [
      {
        title: "Your Profile",
        icon: "mdi-account",
        text: "Your Profile includes your twin ID on the TFChain along with the account address and relay used. Click to view your profile details.",
        path: "/tf-chain/twin",
      },
      {
        title: "Deploy Virtual Machines",
        icon: "mdi-television",
        text: "Deploy Full or Micro Virtual Machines from available images or custom ones on the Threefold Grid.",
        path: "/deploy/vms",
      },
      {
        title: "Deploy Applications",
        icon: "mdi-lightbulb-on-outline",
        text: "Deploy from a wide range of in demand solutions such as Algorand, Funkwhale, Wordpress, Discourse and much more!",
        path: "/deploy/applications",
      },
      {
        title: "Deploy Orchestrators",
        icon: "mdi-group",
        text: "Deploy Kubernetes clusters out of the box or Caprover app/database deployment & web server manager on the Threefold Grid.",
        path: "/deploy/orchestrators",
      },
      {
        title: "Explore Grid Capacity",
        icon: "mdi-chart-scatter-plot",
        text: "View the CPU, SSD, RAM, HDD, GPU, Public IPs, Gateways capacity and more on the Threefold Grid.",
        path: "/tf-grid/stats",
      },
      {
        title: "Explore Grid Nodes",
        icon: "mdi-access-point",
        text: "Find nodes that fit your CPU, GPU, SSD, HDD and RAM capacity needs on the Threefold Grid.",
        path: "/deploy/nodes",
      },
    ];
    return {
      theme,
      pageTitle,
      cards,
      profileManager,

      stats: [
        {
          label: "Capacity",
          value: "33.46PB",
          image: "capacity.png",
        },
        {
          label: "Nodes",
          value: "2420",
          image: "nodes.png",
        },
        {
          label: "Countries",
          value: "60",
          image: "countries.png",
        },
        {
          label: "Cores",
          value: "56,530",
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
  min-width: 180px;
  max-width: 300px;
}
.statcards {
  margin-top: 50rem;
}
.tf-header {
  font-size: 1.25rem;
}
.sub-header {
  font-size: 1rem;
}

.card-opacity {
  background-color: rgba(125, 227, 200, 0.12);
}
</style>
