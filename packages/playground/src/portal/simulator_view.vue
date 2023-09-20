<template>
  <div class="mt-8">
    <v-container>
      <v-card color="calcprimary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
        <!-- <v-icon size="30" class="pr-3" color="white">mdi-calculator</v-icon> -->
        <v-card-title class="pa-0" color="white">Farming Calculator</v-card-title>
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
        <v-col cols="3">
          <input-tooltip
            tooltip="A virtual machine (VM) image is a snapshot or template of a virtual machine that contains the necessary components to create and run a virtual instance of an operating system. It includes the operating system, installed applications, configurations, and any additional files or data required for the virtual machine, also you can put your own image/flist by choosing the other option."
          >
            <v-autocomplete
              label="Choose Configuration"
              :items="[...configuration]"
              return-object
              item-title="name"
              v-model="chosenconfig"
            />
          </input-tooltip>

          <!-- <v-select label="Select"
            :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']"></v-select> -->
        </v-col>
      </v-row>
      <div>
        <!-- <v-select
            label="Select instance capacity"
            v-bind="props"
            :items="packages"
            v-model="solution"
            :disabled="props.disabled"
          /> -->
      </div>
      <DIYFarming v-if="chosenconfig == 'DIY'" />
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

import DIYFarming from "../components/diy_farming.vue";
import { useProfileManager } from "../stores";

const profileManager = useProfileManager();
const configuration = ["DIY", "Titan v2.1"];
const chosenconfig = ref("");

watch([chosenconfig], () => {
  console.log("chosenconfig ", chosenconfig.value);
});
</script>

<style>
.custom-container {
  width: 100%;
}
.v-label {
  font-size: 0.875rem;
}
</style>
