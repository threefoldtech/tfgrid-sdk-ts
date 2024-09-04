<template>
  <v-tooltip location="bottom" close-delay="1000" color="primary">
    <template #activator="{ props }">
      <v-btn v-if="!hideGetTFT" id="tftBtn" variant="elevated" @click="addTFT" :loading="loadingAddTFT" v-bind="props">
        GET TFT
      </v-btn>
    </template>
    <div>
      Get TFT on Stellar using BTC or Credit card, then you can bridge it to your tfchain account using the Bridge in
      the dashboard section.
      <v-btn icon small @click.stop :href="manual.buy_sell_tft" target="_blank"
        ><v-icon>mdi-information-outline</v-icon></v-btn
      >
    </div>
  </v-tooltip>
</template>

<script lang="ts">
import { ref } from "vue";

import { manual } from "@/utils/manual";

export default {
  name: "FundsCard",
  setup() {
    const loadingAddTFT = ref(false);
    const hideGetTFT = window.env.NETWORK == "dev" || window.env.NETWORK == "qa";
    const addTFT = async () => window.open("https://gettft.com/gettft/", "_blank");
    return {
      loadingAddTFT,
      manual,
      addTFT,
      hideGetTFT,
    };
  },
};
</script>

<style>
#tftBtn {
  display: inline-block;
  font-weight: bold;
}

:root {
  --primary: #1aa18f;
}

.v-tooltip > .v-overlay__content {
  pointer-events: initial !important;
}
</style>
