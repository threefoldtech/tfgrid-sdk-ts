<template>
  <v-tooltip location="bottom" close-delay="1000" color="primary">
    <template #activator="{ props }">
      <v-btn id="tftBtn" variant="elevated" @click="addTFT" :loading="loadingAddTFT" v-bind="props"> GET TFT </v-btn>
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

import { useProfileManagerController } from "../components/profile_manager_controller.vue";
import { useProfileManager } from "../stores";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { getGrid } from "../utils/grid";

export default {
  name: "FundsCard",
  setup() {
    const loadingAddTFT = ref(false);
    const ProfileManagerController = useProfileManagerController();
    const profileManager = useProfileManager();

    const addTFT = async () => {
      if (window.env.NETWORK !== "dev" && window.env.NETWORK !== "qa") {
        window.open("https://gettft.com/gettft/", "_blank");
      } else {
        loadingAddTFT.value = true;
        try {
          const grid = await getGrid(profileManager.profile!);
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
  font-weight: bold;
}

:root {
  --primary: #1aa18f;
}

.v-tooltip > .v-overlay__content {
  pointer-events: initial !important;
}
</style>
