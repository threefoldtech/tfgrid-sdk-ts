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
          console.log(profileManager.profile?.address as string);
          await client.tfclient.balances
            .getMoreFunds(
              profileManager.profile?.address as string,
              (res: {
                events?: never[] | undefined;
                status: { type: string; asFinalized: string; isFinalized: string };
              }) => {
                console.log(res);
                if (res instanceof Error) {
                  console.log(res);
                  return;
                }
                const { events = [], status } = res;
                console.log(`Current status is ${status.type}`);
                switch (status.type) {
                  case "Ready":
                    createToast(` Transaction Submitted`, {
                      position: "bottom-right",
                      hideProgressBar: true,
                      toastBackgroundColor: "black",
                      timeout: 5000,
                    });
                }
                if (status.isFinalized) {
                  console.log(`Transaction included at blockHash ${status.asFinalized}`);
                  if (!events.length) {
                    createToast(` Get more TFT failed!`, {
                      position: "bottom-right",
                      hideProgressBar: true,
                      toastBackgroundColor: "black",
                      timeout: 5000,
                    });
                    loadingAddTFT.value = false;
                  } else {
                    // Loop through Vec<EventRecord> to display all events
                    events.forEach(async ({ phase, event: { data, method, section } }) => {
                      console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
                      if (section === "balances" && method === "Transfer") {
                        loadingAddTFT.value = false;
                        createToast(` Success!`, {
                          position: "bottom-right",
                          hideProgressBar: true,
                          toastBackgroundColor: "black",
                          timeout: 5000,
                        });
                        const profile = await loadProfile(client);
                        profileManager.set(profile);
                      } else if (section === "system" && method === "ExtrinsicFailed") {
                        createToast(` Get more TFT failed!`, {
                          position: "bottom-right",
                          hideProgressBar: true,
                          toastBackgroundColor: "black",
                          timeout: 5000,
                        });
                        loadingAddTFT.value = false;
                      }
                    });
                  }
                }
              },
            )
            .catch((err: { message: string }) => {
              console.log(err.message);
              loadingAddTFT.value = false;
              createToast(
                ` Get more TFT failed! <br>Maybe the funding wallet has run out of TFTs. Please contact support`,
                {
                  position: "bottom-right",
                  hideProgressBar: true,
                  toastBackgroundColor: "black",
                  timeout: 5000,
                },
              );
            });
        } catch (e) {
          console.log(e);
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
