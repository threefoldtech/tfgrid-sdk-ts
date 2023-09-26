<template>
  <v-btn
    id="tftBtn"
    width="2000"
    color="white"
    @click="addTFT"
    class="px-lg-6 px-md-2 px-sm-0 mx-sm-0"
    style="color: white; max-width: 140px; width: auto; background-color: var(--primary)"
    :loading="loadingAddTFT"
  >
    GET TFT
  </v-btn>
</template>

<script lang="ts">
import { createToast } from "mosha-vue-toastify";
import { ref } from "vue";

import { useProfileManagerController } from "../components/profile_manager_controller.vue";
import { useProfileManager } from "../stores";
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
          createToast(` Success! You have received TFTs.`, {
            position: "top-right",
            hideProgressBar: true,
            toastBackgroundColor: "#1aa18f",
            timeout: 5000,
            type: "success",
            showIcon: true,
          });
        } catch (e) {
          loadingAddTFT.value = false;
          console.log("Error: ", e);
          createToast(`Get more TFT failed!`, {
            position: "top-right",
            hideProgressBar: true,
            toastBackgroundColor: "black",
            timeout: 5000,
            type: "danger",
            showIcon: true,
          });
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
</style>
