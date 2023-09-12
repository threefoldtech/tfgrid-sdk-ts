<template>
  <v-container fluid>
    <v-skeleton-loader :loading="loadingProposals" max-width="100%" type="image">
      <v-container>
        <v-card class="my-3 pa-3 d-flex justify-center">
          <h3>No proposals at this time</h3>
          <!--add condition-->
        </v-card>
      </v-container>
      <v-container>
        <v-card>
          <v-tabs v-model="activeTab" align-tabs="center">
            <v-tab :value="0" color="primary">Active</v-tab>
            <v-tab :value="1" color="primary">Executable</v-tab>
          </v-tabs>
        </v-card>
        <v-window v-model="activeTab">
          <!--Active-->
          <v-window-item :value="0"> </v-window-item>
        </v-window>
      </v-container>
    </v-skeleton-loader>
  </v-container>
</template>
<script lang="ts" setup>
import { GridClient } from "@threefold/grid_client";
import { onMounted, ref } from "vue";

import { useProfileManager } from "../stores";
import type { proposalInterface } from "../utils/dao";

const loadingProposals = ref(true);
const activeTab = ref(0);
const activeProposals: proposalInterface[] = [];
const inactiveProposals: proposalInterface[] = [];
const proposals = ref({
  active: activeProposals,
  inactive: inactiveProposals,
});

const tabs = [
  { title: "Active", content: activeProposals },
  { title: "Executable", content: inactiveProposals },
];
const gridClient = new GridClient({
  mnemonic: useProfileManager().profile!.mnemonic,
  network: window.env.NETWORK,
});
onMounted(() => {
  gridClient;
});
</script>
