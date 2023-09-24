<template>
  <div class="mt-8">
    <v-container>
      <v-card color="title" class="d-flex justify-center items-center mt-3 pa-3 text-center">
        <v-card-title class="font-weight-bold">Farming Calculator</v-card-title>
      </v-card>

      <v-card class="my-3 pa-3" color="disclaimer">
        <v-card-title class="font-weight-bold">Disclaimer</v-card-title>
        <v-card-text>
          Simulations are NOT investment advice nor should they be looked at in this way. The scenarios shown are by no
          means a guarantee and no one can predict the future of yields exactly as they are heavily dependent on factors
          beyond anyone’s control. The DAO could also decide to change parameters or farming, which could have a
          different result. We invite the community to review and give feedback and make proposals for necessary changes
          here
        </v-card-text>
      </v-card>
      <v-row>
        <v-col cols="4">
          <v-autocomplete
            label="Choose Configuration"
            :items="[...configuration]"
            return-object
            item-title="name"
            v-model="chosenConfig"
          />
        </v-col>
      </v-row>
      <v-divider />
      <SimulatorFarming :chosenConfig="chosenConfig" v-if="chosenConfig != ''" />
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import SimulatorFarming from "../components/simulator_farming.vue";

const configuration = ["DIY", "Titan v2.1"];
const chosenConfig = ref("");
</script>
