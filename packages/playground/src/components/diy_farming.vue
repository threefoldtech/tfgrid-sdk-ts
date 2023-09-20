<template>
  <div class="mt-8">
    <v-container>
      <div class="card-container">
        <v-card width="40%" class="my-3 pa-3">
          <!-- <v-card width="40%"  class="my-3 pa-3" class="d-flex justify-center items-center my-5 pa-3 text-center"> -->

          <!-- <v-icon size="30" class="pr-3" color="white">mdi-calculator</v-icon> -->
          <v-row>
            <v-card-text>
              <b>Note:</b> Make sure to use base 1024 while filling in the simulator, otherwise there might be a
              different payout.
            </v-card-text></v-row
          >
          <div class="mt-3 px-3">
            <input-validator :value="memory" :rules="[validators.min('Value must be positive.', 0)]" #="{ props }">
              <v-text-field label="Memory(GB)" suffix="GB" type="number" v-model.number="memory" v-bind="props" />
            </input-validator>

            <input-validator
              :value="memory"
              :rules="[
                validators.required('CPU is required.'),
                validators.isInt('CPU must be a valid integer.'),
                validators.min('CPU min is 1 cores.', 1),
                validators.max('CPU max is 256 cores.', 256),
              ]"
              #="{ props }"
            >
              <v-text-field label="vCPU (Threads)" suffix="GB" type="number" v-model.number="memory" v-bind="props" />
            </input-validator>
            <input-validator
              :value="memory"
              :rules="[
                validators.required('CPU is required.'),
                validators.isInt('CPU must be a valid integer.'),
                validators.min('CPU min is 1 cores.', 1),
                validators.max('CPU max is 256 cores.', 256),
              ]"
              #="{ props }"
            >
              <v-text-field label="Memory(GB)" suffix="GB" type="number" v-model.number="memory" v-bind="props" />
            </input-validator>
            <input-validator
              :value="memory"
              :rules="[
                validators.required('CPU is required.'),
                validators.isInt('CPU must be a valid integer.'),
                validators.min('CPU min is 1 cores.', 1),
                validators.max('CPU max is 256 cores.', 256),
              ]"
              #="{ props }"
            >
              <v-text-field label="Memory(GB)" suffix="GB" type="number" v-model.number="memory" v-bind="props" />
            </input-validator>
            <input-validator
              :value="memory"
              :rules="[
                validators.required('CPU is required.'),
                validators.isInt('CPU must be a valid integer.'),
                validators.min('CPU min is 1 cores.', 1),
                validators.max('CPU max is 256 cores.', 256),
              ]"
              #="{ props }"
            >
              <v-text-field label="Memory(GB)" suffix="GB" type="number" v-model.number="memory" v-bind="props" />
            </input-validator>
            <input-validator
              :value="memory"
              :rules="[
                validators.required('CPU is required.'),
                validators.isInt('CPU must be a valid integer.'),
                validators.min('CPU min is 1 cores.', 1),
                validators.max('CPU max is 256 cores.', 256),
              ]"
              #="{ props }"
            >
              <v-text-field label="Memory(GB)" suffix="GB" type="number" v-model.number="memory" v-bind="props" />
            </input-validator>
            <input-validator
              :value="memory"
              :rules="[
                validators.required('CPU is required.'),
                validators.isInt('CPU must be a valid integer.'),
                validators.min('CPU min is 1 cores.', 1),
                validators.max('CPU max is 256 cores.', 256),
              ]"
              #="{ props }"
            >
              <v-text-field label="Memory(GB)" suffix="GB" type="number" v-model.number="memory" v-bind="props" />
            </input-validator>
          </div>
        </v-card>

        <v-card width="59%" class="ml-3 pa-3">
          <v-card-title class="font-weight-bold">Disclaimer</v-card-title>
          <v-card-text>
            <b>Note:</b> Make sure to use base 1024 while filling in the simulator, otherwise there might be a different
            payout.
          </v-card-text>
        </v-card>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

import { useProfileManager } from "../stores";

// const profileManager = useProfileManager();
// const configuration = ["DIY", "Titan v2.1"];
// const chosenconfig = ref("");
const memory = ref(32);

// watch([chosenconfig], () => {
//   console.log("chosenconfig ", chosenconfig.value);
// });
</script>

<script lang="ts">
export default {
  name: "DIYFarming",
};
</script>

<style>
.custom-container {
  width: 100%;
}
.v-label {
  font-size: 0.875rem;
}

.card-container {
  display: flex;
  flex-wrap: wrap; /* Allow cards to wrap to the next line if necessary */
  justify-content: space-between; /* Distribute space between the cards */
}

.custom-switch-label {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Style the label for the switch */
label {
  margin-top: 8px; /* Adjust as needed */
}
</style>
