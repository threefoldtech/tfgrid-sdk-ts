<template>
  <div :style="{ paddingBottom: '250px' }">
    <v-alert type="info" variant="tonal">
      Please connect to your tfchain wallet <a class="app-link" @click="$emit('openProfile')">here</a>
    </v-alert>
    <div>
      <h4 class="text-center text-h3 mt-16">A Co-Owned Global Sovereign Internet</h4>
      <v-container class="d-flex justify-center mt-4">
        <p class="text-center">
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
    </div>

    <v-container>
      <div
        :style="{
          backgroundImage: 'url(' + baseUrl + 'images/live-and-operational-background.png)',
          padding: '100px 0',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          minHeight: '850px',
        }"
      >
        <!-- class="d-flex justify-center align-center" -->
        <div class="d-flex justify-center mb-10">
          <v-card flat class="py-1 px-2 d-inline-block m-auto">
            <h4 class="text-center text-h3">Live and Operational</h4>
          </v-card>
        </div>

        <div class="d-flex flex-wrap justify-space-around">
          <div v-for="s in stats" :key="s.value" class="stats">
            <v-card>
              <v-img
                cover
                width="200"
                class="mx-auto"
                :src="baseUrl + 'images/icons/live-and-operational/' + s.image"
              />
              <v-card-text>
                <p class="text-center font-weight-bold text-h4">{{ s.value }}</p>
                <p class="text-center text-h6">{{ s.label }}</p>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <div class="d-flex justify-center mt-16">
          <v-btn color="primary" target="_blank" :href="capacityURL"> Explore ThreeFold Grid Capacity </v-btn>
        </div>
      </div>
    </v-container>

    <v-container>
      <h4 class="text-center text-h3 mb-8">The <strong>Layer Zero</strong> for a Decentralized World</h4>
      <p class="text-center">
        Anything that runs on Linux can run on ThreeFold – with more security, more sustainably, and in true
        decentralization. The ThreeFold Grid can support workloads from Blockchain to Web2 to Web3 to IoT and Metaverse
        and more.
      </p>

      <div class="d-flex justify-center align-center flex-wrap mt-8">
        <v-btn class="mr-2" variant="tonal" color="primary" target="_blank" href="https://www.threefold.io/grid/">
          Learn about the grid
        </v-btn>
        <v-btn variant="tonal" color="primary" target="_blank" href="https://www.threefold.io/build/">
          Use The Grid
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts">
import { useTheme } from "vuetify";

import { getCapacityURL } from "../utils/getCapacityUrl";

export default {
  name: "ConnectWalletLanding",
  setup() {
    const theme = useTheme();
    const baseUrl = import.meta.env.BASE_URL;
    const network = process.env.NETWORK || (window as any).env.NETWORK;
    const capacityURL = getCapacityURL(network);

    return {
      theme,
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
      capacityURL,
    };
  },
};
</script>

<style>
.stats {
  flex-grow: 1;
  min-width: 280px;
  max-width: 300px;
  padding: 15px 15px 0;
}
</style>
