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
      the portal section.
      <v-btn
        icon
        small
        @click.stop
        href="https://manual.grid.tf/threefold_token/buy_sell_tft/gettft.html"
        target="_blank"
        ><v-icon>mdi-information-outline</v-icon></v-btn
      >
    </div>
  </v-tooltip>
</template>

<script lang="ts">
import { ref } from "vue";

import { useProfileManagerController } from "../components/profile_manager_controller.vue";
import { useProfileManager } from "../stores";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { getGrid } from "../utils/grid";

export default {
  name: "FundsCard",
  setup() {
    const loadingAddTFT = ref(false);
    const profileManager = useProfileManager();
    const ProfileManagerController = useProfileManagerController();
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
