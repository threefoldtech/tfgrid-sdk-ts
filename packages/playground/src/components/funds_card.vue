<template>
  <v-tooltip location="bottom" close-delay="1000" color="primary">
    <template #activator="{ props }">
      <v-btn
        id="tftBtn"
        width="2000"
        color="white"
        @click="addTFT"
        class="px-lg-6 px-md-2 px-sm-0 mx-sm-0"
        style="color: white; max-width: 140px; width: auto; background-color: var(--primary)"
        :loading="loadingAddTFT"
        v-bind="props"
      >
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
import type { GridClient } from "@threefold/grid_client";
import { ref } from "vue";

import { manual } from "@/utils/manual";

import { useProfileManagerController } from "../components/profile_manager_controller.vue";
import { useGrid } from "../stores";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { updateGrid } from "../utils/grid";

export default {
  name: "FundsCard",
  setup() {
    const loadingAddTFT = ref(false);
    const ProfileManagerController = useProfileManagerController();
    const gridStore = useGrid();
    const grid = gridStore.client as GridClient;

    const addTFT = async () => {
      if (window.env.NETWORK !== "dev" && window.env.NETWORK !== "qa") {
        window.open("https://gettft.com/gettft/", "_blank");
      } else {
        loadingAddTFT.value = true;
        try {
          updateGrid(grid, { projectName: "" });
          await grid?.balance.getMoreFunds();
          await ProfileManagerController.reloadBalance();
          loadingAddTFT.value = false;
          createCustomToast("Success! You have received TFTs.", ToastType.success);
        } catch (e) {
          loadingAddTFT.value = false;
          console.log("Error: ", e);
          createCustomToast("Get more TFT failed!", ToastType.danger);
        }
      }
    };
    return {
      loadingAddTFT,
      manual,
      addTFT,
    };
  },
};
</script>

<style>
#tftBtn {
  display: inline-block;
  min-width: 10px !important;
}

:root {
  --primary: #1aa18f;
}

.v-tooltip > .v-overlay__content {
  pointer-events: initial !important;
}
</style>
