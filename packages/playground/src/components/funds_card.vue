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
import { GridClient } from "@threefold/grid_client";
import { createToast } from "mosha-vue-toastify";
import { ref } from "vue";

import { useProfileManager } from "../stores";
import { loadProfile } from "../utils/grid";

export default {
  name: "FundsCard",
  setup() {
    const loadingAddTFT = ref(false);
    const profileManager = useProfileManager();

    const addTFT = async () => {
      if (window.env.NETWORK !== "dev" && window.env.NETWORK !== "qa") {
        window.open("https://gettft.com/gettft/", "_blank");
      } else {
        loadingAddTFT.value = true;
        try {
          const client = new GridClient({ mnemonic: profileManager.profile!.mnemonic, network: window.env.NETWORK });
          client.connect();
          await client.tfclient.balances.getMoreFunds();
          loadingAddTFT.value = false;
          const profile = await loadProfile(client);
          profileManager.set(profile);
          createToast(`Success!`, {
            position: "bottom-right",
            hideProgressBar: true,
            toastBackgroundColor: "#1aa18f",
            timeout: 5000,
            type: "success",
            showIcon: true,
          });
        } catch (e) {
          console.log("Error: ", e);
          createToast(`Get more TFT failed!`, {
            position: "bottom-right",
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
