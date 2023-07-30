<template>
  <v-card>
    <v-card-title class="font-weight-bold">Disclaimer</v-card-title>
    <v-card-text v-if="network !== 'main' && nw !== 'main'">
      This is {{ nw }} environment. We're still ironing out the kinks. If there are any issues, please let us know
      <a class="app-link" href="https://github.com/threefoldtech/test_feedback/issues" target="_blank">here.</a>
    </v-card-text>
    <v-card-text v-else>
      <v-icon>mdi-information</v-icon>
      This version of the Playground is experimental. Please get in touch with any issues.
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const network = process.env.NETWORK || window.env.NETWORK;
const nw = computed(() => {
  switch (network) {
    case "dev":
      return "a development";
    case "qa":
      return "an intetrnal testing";
    case "test":
      return "a testing";
  }
  return network;
});
</script>

<script lang="ts">
export default {
  name: "DisclaimerToolbar",
};
</script>
