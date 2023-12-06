<template>
  <div class="border px-4 pb-4 rounded position-relative mt-2">
    <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-chart-line</v-icon>
      <v-card-title class="pa-0">Farming Calculator</v-card-title>
    </v-card>

    <v-card class="my-3 pa-2">
      <v-card-title class="font-weight-bold">Disclaimer</v-card-title>
      <v-card-text>
        Simulations are NOT investment advice nor should they be looked at in this way. The scenarios shown are by no
        means a guarantee and no one can predict the future of yields exactly as they are heavily dependent on factors
        beyond anyone’s control. The DAO could also decide to change parameters or farming, which could have a different
        result. We invite the community to review and give feedback and make proposals for necessary changes here
      </v-card-text>
    </v-card>
    <v-row>
      <v-col cols="12">
        <v-autocomplete
          label="Choose Configuration"
          :items="[...configuration]"
          return-object
          item-title="name"
          v-model="chosenConfig"
        />
      </v-col>
    </v-row>
    <SimulatorFarming :profile="activeProfile" :chosenConfig="chosenConfig" v-if="chosenConfig != ''" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

import { ProfileTypes } from "@/types";

import SimulatorFarming, { createFarmingProfile } from "../components/simulator.vue";
const activeProfile = ref(createFarmingProfile());

const configuration = ["DIY", "Titan v2.1"];
const chosenConfig = ref("");

watch([chosenConfig], () => {
  if (chosenConfig.value == "Titan v2.1") {
    // activeProfile.value = { type:ProfileTypes.TITAN, name: "Titan v2.1", memory: 32,cpu:8, hdd: 0, ssd: 1000, price: 0.08, priceAfter5Years: 1, investmentCostHW: 800};
    activeProfile.value.type = ProfileTypes.TITAN;
    activeProfile.value.name = "Titan v2.1";
    activeProfile.value.memory = 32;
    activeProfile.value.cpu = 8;
    activeProfile.value.hdd = 0;
    activeProfile.value.ssd = 1000;
    activeProfile.value.price = 0.08;
    activeProfile.value.priceAfter5Years = 1;
    activeProfile.value.investmentCostHW = 800;
  } else {
    activeProfile.value.type = ProfileTypes.DIY;
    activeProfile.value.name = "DIY";
    activeProfile.value.memory = 32;
    activeProfile.value.cpu = 8;
    activeProfile.value.hdd = 10000;
    activeProfile.value.ssd = 1000;
    activeProfile.value.price = 0.08;
    activeProfile.value.priceAfter5Years = 1;
  }
});
</script>
