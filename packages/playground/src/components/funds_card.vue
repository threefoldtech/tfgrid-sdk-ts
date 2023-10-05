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
import { ref } from "vue";

import { createCustomToast } from "../components/custom_toast.vue";
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
          createCustomToast("Success! You have received TFTs.", "success");
        } catch (e) {
          loadingAddTFT.value = false;
          console.log("Error: ", e);
          createCustomToast("Get more TFT failed!", "danger");
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

.mosha__toast__content-wrapper {
  margin-bottom: -2px;
}
</style>
