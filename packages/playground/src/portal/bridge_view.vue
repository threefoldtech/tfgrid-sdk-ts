<template>
  <v-container>
    <DepositDialog v-if="openDepositDialog" :openDepositDialog="openDepositDialog"></DepositDialog>
  </v-container>
  <div class="mt-8">
    <v-container class="custom-container">
      <v-card color="primary" class="my-3 pa-3 text-center">
        <v-icon width="26">mdi-swap-horizontal</v-icon>
        <h2>Transfer TFT Across Chains</h2>
      </v-card>
      <v-card class="pa-5 my-5 white--text">
        <v-row class="pa-5 text-center">
          <v-col cols="12">
            <v-select
              :items="items"
              label="Please select a chain:"
              item-title="name"
              item-value="id"
              v-model="selectedItem"
            ></v-select>
          </v-col>
        </v-row>
        <v-row class="pa-4 px-8">
          <v-btn color="primary" class="mr-2 bold-text" @click="openDepositDialog = true">Deposit</v-btn>
          <v-btn color="black" class="mr-2 bold-text">Withdraw</v-btn>
          <v-btn color="blue" class="ml-auto bold-text" @click="navigation">Learn How?</v-btn>
        </v-row>
      </v-card>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import DepositDialog from "../components/depositDialog.vue";

const items = ref([{ id: 1, name: "stellar" }]);
const selectedItem = ref(items.value[0]);
const openDepositDialog = ref(false);

function navigation() {
  window.open(
    "https://manual.grid.tf/threefold_token/tft_bridges/tfchain_stellar_bridge.html#how-to-use-the-tfchain-stellar-bridge",
    "_blank",
  );
}
</script>

<style>
.custom-container {
  width: 80%;
}
</style>
